import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getDoctorAppointments,
  cancelAppointment,
} from "../../api/doctor/doctorApi";
import {
  Popconfirm,
  message,
  Modal,
  Select,
  DatePicker,
  Button,
  Pagination,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { IDoctorData } from "../../interfaces/doctor";
import { ApiError } from "../../interfaces/error";

interface medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | undefined;
}

interface prescriptionData {
  appointmentId: string;
  userId: string;
  doctorId: string;
  medicalCondition: string;
  medications: medication[];
  medicationPeriod: number;
  notes?: string;
  createdAt?: Date;
}

interface IAppointment {
  _id: string;
  userId: string;
  doctorId: string;
  slotId: string;
  start: string;
  date: string;
  end: string;
  duration: number;
  fee: number;
  appointmentStatus: "booked" | "cancelled" | "completed" | "pending";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  stripeSessionId: string;
  userName: string;
  userEmail: string;
  doctorName: string;
  doctorCategory: string;
  createdAt: string;
  updatedAt: string;
  profile?: string;
  prescriptions?: prescriptionData[];
}

interface Notification {
  userId: string;
  message: string;
  type:
    | "appointment"
    | "payment"
    | "blog"
    | "add"
    | "newConnection"
    | "common"
    | "reportAnalysis";
  isRead: boolean;
  link?: string;
  mention?: string;
  createdAt: string;
}

const { Option } = Select;
const { RangePicker } = DatePicker;

const DoctorAppointments = () => {
  const [isCanceling, setIsCanceling] = useState(false);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState({
    appointmentStatus: "booked",
    dateRange: null as [moment.Moment, moment.Moment] | null,
  });
  const [selectedAppointment, setSelectedAppointment] =
    useState<IAppointment | null>(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const doctor = useSelector((state: IDoctorData) => state.doctor.doctor);
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL as string;

  const getAccessToken = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/doctor/refreshToken`,
        {},
        { withCredentials: true }
      );
      return response.data.accessToken;
    } catch (error) {
      console.error("Failed to fetch access token:", error);
      message.error("Session expired. Please log in again.");
      throw error;
    }
  };

  useEffect(() => {
    const setupSocket = async () => {
      if (!doctor?._id) return;

      let token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userAccessToken="))
        ?.split("=")[1];

      if (!token) {
        token = await getAccessToken();
      }

      const socket = io(
        import.meta.env.VITE_REACT_APP_SOCKET_URL ||
          "https://api.abdullhakalamban.online",
        {
          transports: ["websocket"],
          reconnection: true,
          auth: { token },
        }
      );

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log(`Socket connected for user ${doctor._id}`);
        socket.emit("join", doctor._id);
      });

      socket.on("connect_error", async (err) => {
        console.error("Socket connection error:", err.message);
        if (err.message.includes("Invalid or expired token")) {
          try {
            const newToken = await getAccessToken();
            socket.auth = { token: newToken };
            socket.connect();
          } catch {
            message.error("Failed to reconnect. Please log in again.");
          }
        } else {
          message.error(
            "Failed to connect to notification server: " + err.message
          );
        }
      });

      socket.on("error", ({ message }) => {
        console.error("Socket error:", message);
        message.error(message);
      });

      return () => {
        socket.disconnect();
      };
    };

    setupSocket();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [doctor?._id]);

  const fetchAppointments = async (page: number) => {
    setLoading(true);
    try {
      const response = await getDoctorAppointments(doctor._id, page, limit, {
        appointmentStatus: filters.appointmentStatus,
        startDate: filters.dateRange
          ? filters.dateRange[0].toISOString().split("T")[0]
          : undefined,
        endDate: filters.dateRange
          ? filters.dateRange[1].toISOString().split("T")[0]
          : undefined,
      });

      console.log("doctor appointments...", response);
      setAppointments(response.appointments || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      const errorMessage =
        (error as ApiError)?.response?.data?.message ??
        "Failed fetching appointments. Please try again.";
      setErrorMessage(
        typeof errorMessage === "string"
          ? errorMessage
          : "Failed fetching appointments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctor._id) fetchAppointments(currentPage);
  }, [doctor._id, currentPage, filters]);

  const handleFilterChange = (
    key: string,
    value: string | [moment.Moment, moment.Moment] | null
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      setIsCanceling(true);
      setErrorMessage("");
      const response = await cancelAppointment(appointmentId);
      if (response.status) {
        message.success(response.message);

        let doctorName: string = "";
        let userId: string = "";
        let date: string = "";

        const targetAppointment = appointments.find(
          (appt) => appt._id === appointmentId
        );
        if (targetAppointment) {
          doctorName = targetAppointment.doctorName || "Patient";
          userId = targetAppointment.userId || "";
          date = targetAppointment.date || "";
        } else {
          console.warn("Appointment not found in state.");
        }

        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentId
              ? {
                  ...appt,
                  appointmentStatus: "cancelled",
                  paymentStatus: "refunded",
                }
              : appt
          )
        );

        if (userId) {
          const notification: Notification = {
            userId: userId,
            message: `Your appointment with Dr.${doctorName} on ${new Date(
              date
            ).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })} has been cancelled due to unforeseen circumstances. Please reschedule at the next available slot.`,
            type: "appointment",
            isRead: false,
            link: "/user/appointments",
            mention: `Dr.${doctorName}`,
            createdAt: new Date().toISOString(),
          };

          socketRef.current?.emit("sendNotification", notification);
        } else {
          console.warn("Missing doctorId for notification.");
        }
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      const errorMessage =
        (error as ApiError)?.response?.data?.message ??
        "Failed to cancel appointment. Please try again.";
      setErrorMessage(
        typeof errorMessage === "string"
          ? errorMessage
          : "Failed to cancel appointment. Please try again."
      );
    } finally {
      setIsCanceling(false);
    }
  };

  const handleJoin = (appointmentId: string, appointment: IAppointment) => {
    navigate(`/doctor/video-call/${appointmentId}`, { state: { appointment } });
  };

  const handleViewPrescription = (appointment: IAppointment) => {
    setSelectedAppointment(appointment);
    setIsPrescriptionModalOpen(true);
  };

  const isJoinable = (start: string, end: string) => {
    const now = new Date().getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const buffer = 5 * 60 * 1000; // 5-minute buffer
    return now >= startTime - buffer && now <= endTime + buffer;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full sm:max-w-3xl lg:max-w-5xl mx-auto">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">
          My Appointments
        </h2>

        {/* Filters */}
        <div className="mb-4 sm:mb-6 bg-white p-4 sm:p-6 rounded-xl shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 w-full">
            <FilterOutlined className="text-gray-600 text-sm sm:text-base" />
            <Select
              placeholder="Filter by Status"
              className="w-full"
              value={filters.appointmentStatus}
              onChange={(value) =>
                handleFilterChange("appointmentStatus", value)
              }
              allowClear
            >
              <Option value="booked">Booked</Option>
              <Option value="cancelled">Cancelled</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </div>
          <div className="flex items-center gap-2 w-full">
            <FilterOutlined className="text-gray-600 text-sm sm:text-base" />
            <RangePicker
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  handleFilterChange("dateRange", [
                    moment(dates[0].toDate()),
                    moment(dates[1].toDate()),
                  ]);
                } else {
                  handleFilterChange("dateRange", null);
                }
              }}
              format="YYYY-MM-DD"
              className="w-full"
            />
          </div>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => fetchAppointments(currentPage)}
            className="w-full sm:w-auto mt-2 sm:mt-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            Apply Filters
          </Button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 sm:mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-xs sm:text-sm md:text-base flex items-center gap-2 flex-wrap">
            <FileTextOutlined className="text-red-500" />
            {errorMessage}
          </div>
        )}

        {/* Appointments */}
        {loading ? (
          <div className="text-center text-gray-500 py-8 text-xs sm:text-sm md:text-base">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-xs sm:text-sm md:text-base">
            No appointments found.
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6 transition-shadow duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 sm:gap-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <img
                      src={
                        appt.profile ||
                        "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"
                      }
                      alt="User"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-sm"
                    />
                    <div>
                      <p
                        className="text-sm sm:text-base font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[200px]"
                        title={appt.userName}
                      >
                        {appt.userName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        ({appt.doctorCategory})
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Date & Time:{" "}
                      </span>
                      {moment(appt.start).format("DD-MM-YYYY hh:mm A")} -{" "}
                      {moment(appt.end).format("hh:mm A")}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Duration:{" "}
                      </span>
                      {appt.duration} minutes
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fee: </span>₹
                      {appt.fee}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Status:{" "}
                      </span>
                      {appt.appointmentStatus.charAt(0).toUpperCase() +
                        appt.appointmentStatus.slice(1)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email: </span>
                      <span
                        className="truncate max-w-[150px] sm:max-w-[200px]"
                        title={appt.userEmail}
                      >
                        {appt.userEmail}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {appt.appointmentStatus === "booked" && (
                      <button
                        onClick={() => handleJoin(appt._id, appt)}
                        disabled={!isJoinable(appt.start, appt.end)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg min-w-[100px] ${
                          isJoinable(appt.start, appt.end)
                            ? "bg-green-600 hover:bg-green-700 active:scale-95"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Join
                      </button>
                    )}
                    {appt.appointmentStatus === "booked" && (
                      <Popconfirm
                        title="Cancel Appointment"
                        description="Are you sure to cancel this appointment?"
                        onConfirm={() => handleCancel(appt._id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <button
                          disabled={
                            isCanceling || appt.appointmentStatus !== "booked"
                          }
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg min-w-[100px] ${
                            isCanceling
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700 active:scale-95"
                          }`}
                        >
                          Cancel
                        </button>
                      </Popconfirm>
                    )}
                    {appt.appointmentStatus ==="completed" &&
                      appt.prescriptions &&
                      appt.prescriptions.length > 0 && (
                        <button
                          onClick={() => handleViewPrescription(appt)}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700 active:scale-95 min-w-[100px]"
                        >
                          View Prescription
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 sm:mt-6 flex justify-center sm:justify-end">
          <Pagination
            current={currentPage}
            total={totalPages * limit}
            pageSize={limit}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            className="ant-pagination"
          />
        </div>

        {/* Prescription Modal */}
        <Modal
          title={
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
              Prescription Details
            </h3>
          }
          open={isPrescriptionModalOpen}
          onCancel={() => setIsPrescriptionModalOpen(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setIsPrescriptionModalOpen(false)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 min-w-[100px]"
            >
              Close
            </Button>,
          ]}
          className="rounded-xl"
          bodyStyle={{ padding: "16px 24px" }}
          width="100%"
          style={{ maxWidth: "640px" }}
        >
          {selectedAppointment && (
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                <img
                  src={
                    selectedAppointment.profile ||
                    "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"
                  }
                  alt="User"
                  className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full object-cover shadow-md"
                />
                <div className="text-center sm:text-left">
                  <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                    {selectedAppointment.userName}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {selectedAppointment.doctorCategory}
                  </p>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-sm sm:text-base font-semibold text-gray-700">
                  Prescriptions
                </h4>
                {selectedAppointment.prescriptions &&
                selectedAppointment.prescriptions.length > 0 ? (
                  selectedAppointment.prescriptions.map(
                    (prescription, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200"
                      >
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Prescription {index + 1}
                        </p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Appointment ID:{" "}
                            </span>
                            <span
                              className="truncate max-w-[150px] sm:max-w-[200px]"
                              title={prescription.appointmentId}
                            >
                              {prescription.appointmentId}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              User ID:{" "}
                            </span>
                            <span
                              className="truncate max-w-[150px] sm:max-w-[200px]"
                              title={prescription.userId}
                            >
                              {prescription.userId}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Doctor ID:{" "}
                            </span>
                            <span
                              className="truncate max-w-[150px] sm:max-w-[200px]"
                              title={prescription.doctorId}
                            >
                              {prescription.doctorId}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Medical Condition:{" "}
                            </span>
                            <span
                              className="truncate max-w-[150px] sm:max-w-[200px]"
                              title={prescription.medicalCondition}
                            >
                              {prescription.medicalCondition}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Medication Period:{" "}
                            </span>
                            {prescription.medicationPeriod} days
                          </div>
                          {prescription.createdAt && (
                            <div>
                              <span className="font-medium text-gray-700">
                                Created At:{" "}
                              </span>
                              {moment(prescription.createdAt).format(
                                "DD-MM-YYYY hh:mm A"
                              )}
                            </div>
                          )}
                        </div>
                        {prescription.notes && (
                          <div className="mt-2 sm:mt-3">
                            <span className="font-medium text-gray-700">
                              Notes:{" "}
                            </span>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">
                              {prescription.notes}
                            </p>
                          </div>
                        )}
                        <div className="mt-2 sm:mt-3">
                          <span className="font-medium text-gray-700">
                            Medications:{" "}
                          </span>
                          {prescription.medications &&
                          prescription.medications.length > 0 ? (
                            <div className="space-y-2 sm:space-y-3 mt-2">
                              {prescription.medications.map((med, medIndex) => (
                                <div
                                  key={medIndex}
                                  className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 shadow-sm"
                                >
                                  <p className="text-xs sm:text-sm font-medium text-gray-700">
                                    Medication {medIndex + 1}
                                  </p>
                                  <div className="grid grid-cols-1 gap-1 sm:gap-2 text-xs sm:text-sm">
                                    <p>
                                      <span className="font-medium text-gray-700">
                                        Name:{" "}
                                      </span>
                                      {med.name}
                                    </p>
                                    <p>
                                      <span className="font-medium text-gray-700">
                                        Dosage:{" "}
                                      </span>
                                      {med.dosage}
                                    </p>
                                    <p>
                                      <span className="font-medium text-gray-700">
                                        Frequency:{" "}
                                      </span>
                                      {med.frequency}
                                    </p>
                                    <p>
                                      <span className="font-medium text-gray-700">
                                        Duration:{" "}
                                      </span>
                                      {med.duration}
                                    </p>
                                    {med.instructions && (
                                      <p>
                                        <span className="font-medium text-gray-700">
                                          Instructions:{" "}
                                        </span>
                                        {med.instructions}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm text-gray-600">
                              No medications listed.
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-xs sm:text-sm text-gray-600">
                    No prescriptions available.
                  </p>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default DoctorAppointments;
