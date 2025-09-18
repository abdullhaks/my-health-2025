import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAppointments, cancelAppointment } from "../../api/user/userApi";
import { useNavigate } from "react-router-dom";
import {
  Popconfirm,
  message,
  Select,
  DatePicker,
  Button,
  Pagination,
  Modal,
} from "antd";
import { updateUser } from "../../redux/slices/userSlices";
import { io, Socket } from "socket.io-client";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import { IUserData } from "../../interfaces/user";
import { ApiError } from "../../interfaces/error";

interface IAppointment {
  _id: string;
  userId: string;
  doctorId: string;
  slotId: string;
  date: string;
  start: string;
  end: string;
  duration: number;
  fee: number;
  appointmentStatus: "booked" | "cancelled" | "completed";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  stripeSessionId: string;
  userName: string;
  userEmail: string;
  doctorName: string;
  doctorCategory: string;
  createdAt: string;
  updatedAt: string;
  profile?: string;
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

const UserAppointments = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;
  const user = useSelector((state: IUserData) => state.user.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);
  const [filters, setFilters] = useState({
    appointmentStatus: "booked",
    dateRange: null as [moment.Moment, moment.Moment] | null,
  });
  const [selectedAppointment, setSelectedAppointment] =
    useState<IAppointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL as string;

  const getAccessToken = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/user/refreshToken`,
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
      if (!user?._id) return;

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
        console.log(`Socket connected for user ${user._id}`);
        socket.emit("join", user._id);
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
  }, [user?._id]);

  const fetchAppointments = async (page: number) => {
    try {
      setIsFetching(true);
      setErrorMessage("");
      const response = await getUserAppointments(user._id, page, limit, {
        appointmentStatus: filters.appointmentStatus,
        startDate: filters.dateRange
          ? filters.dateRange[0].toISOString().split("T")[0]
          : undefined,
        endDate: filters.dateRange
          ? filters.dateRange[1].toISOString().split("T")[0]
          : undefined,
      });

      setAppointments(response.appointments || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setErrorMessage(
        (error as ApiError).response?.data?.message ||
          "Failed to load appointments. Please try again."
      );
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (user._id) fetchAppointments(currentPage);
  }, [user._id, currentPage, filters]);

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
        dispatch(updateUser(response.updatedUser));
        message.success(response.message);

        let userName: string = "";
        let doctorId: string = "";
        let date: string = "";

        const targetAppointment = appointments.find(
          (appt) => appt._id === appointmentId
        );
        if (targetAppointment) {
          userName =
            targetAppointment.userName ||
            response.updatedUser?.fullName ||
            "Patient";
          doctorId = targetAppointment.doctorId || "";
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

        if (doctorId) {
          const notification: Notification = {
            userId: doctorId,
            message: `Your appointment with ${userName} on ${new Date(
              date
            ).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })} has been cancelled.`,
            type: "appointment",
            isRead: false,
            link: "/doctor/appointments",
            mention: userName,
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
      setErrorMessage(
        (error as ApiError).response?.data?.message ||
          "Failed to cancel appointment. Please try again."
      );
    } finally {
      setIsCanceling(false);
    }
  };

  const handleJoin = (appointmentId: string, appointment: IAppointment) => {
    navigate(`/user/video-call/${appointmentId}`, { state: { appointment } });
  };

  const handleGetPrescription = (appointmentId: string) => {
    navigate(`/user/prescription/${appointmentId}`);
  };

  const handleViewDetails = (appointment: IAppointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const isJoinable = (start: string, end: string) => {
    const now = new Date().getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const buffer = 5 * 60 * 1000; // 5-minute buffer
    return now >= startTime - buffer && now <= endTime + buffer;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">
          My Appointments
        </h2>

        {/* Filters */}
        <div className="mb-4 sm:mb-6 bg-white p-4 sm:p-6 rounded-2xl shadow-md flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FilterOutlined className="text-gray-600 text-lg" />
            <Select
              placeholder="Filter by Status"
              className="w-full sm:w-48 md:w-56"
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
          <div className="flex items-center gap-2 w-full sm:w-full md:w-auto">
            <FilterOutlined className="text-gray-600 text-lg" />
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
            className="w-full sm:w-auto mt-2 sm:mt-0"
          >
            Apply Filters
          </Button>
        </div>

        {errorMessage && (
          <div className="mb-4 sm:mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm sm:text-base">
            {errorMessage}
          </div>
        )}

        {isFetching ? (
          <div className="text-center text-gray-500 py-8 text-sm sm:text-base">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm sm:text-base">
            No appointments found.
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="bg-white rounded-2xl shadow-md p-4 sm:p-6 transition-shadow duration-200 hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 sm:gap-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <img
                      src={
                        appt.profile ||
                        "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"
                      }
                      alt="Doctor"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-sm"
                    />
                    <div>
                      <p className="text-sm sm:text-base font-medium text-gray-900">
                        Dr. {appt.doctorName}
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
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {appt.appointmentStatus === "booked" && (
                      <button
                        onClick={() => handleJoin(appt._id, appt)}
                        disabled={!isJoinable(appt.start, appt.end)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg text-white font-medium transition-colors duration-200 shadow-sm ${
                          isJoinable(appt.start, appt.end)
                            ? "bg-green-600 hover:bg-green-700 active:scale-95"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Join
                      </button>
                    )}

                    {appt.appointmentStatus === "completed" && (
                      <button
                        onClick={() => handleGetPrescription(appt._id)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg text-white font-medium transition-colors duration-200 shadow-sm bg-blue-600 hover:bg-blue-700 active:scale-95"
                      >
                        Get Prescription
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
                          className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg text-white font-medium transition-colors duration-200 shadow-sm ${
                            isCanceling
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700 active:scale-95"
                          }`}
                        >
                          Cancel
                        </button>
                      </Popconfirm>
                    )}

                    <button
                      onClick={() => handleViewDetails(appt)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg text-blue-600 font-medium border border-blue-600 hover:bg-blue-50 transition-colors duration-200 shadow-sm active:scale-95"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 sm:mt-6 flex justify-end">
          <Pagination
            current={currentPage}
            total={totalPages * limit}
            pageSize={limit}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            className="ant-pagination"
          />
        </div>
      </div>

      {/* Appointment Details Modal */}
      <Modal
        title={
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            Appointment Details
          </h3>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="rounded-2xl"
        bodyStyle={{ padding: "16px 24px" }}
        width="100%"
        style={{ maxWidth: "640px" }}
      >
        {selectedAppointment && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <img
                src={
                  selectedAppointment.profile ||
                  "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"
                }
                alt="Doctor"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-md"
              />
              <div className="text-center sm:text-left">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                  Dr. {selectedAppointment.doctorName}
                </h4>
                <p className="text-sm sm:text-base text-gray-600">
                  {selectedAppointment.doctorCategory}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
              <div>
                <p className="font-medium text-gray-700">Date & Time:</p>
                <p className="text-gray-900">
                  {moment(selectedAppointment.start).format(
                    "DD-MM-YYYY hh:mm A"
                  )}{" "}
                  - {moment(selectedAppointment.end).format("hh:mm A")}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Duration:</p>
                <p className="text-gray-900">
                  {selectedAppointment.duration} minutes
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Fee:</p>
                <p className="text-gray-900">₹{selectedAppointment.fee}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Status:</p>
                <p className="text-gray-900 capitalize">
                  {selectedAppointment.appointmentStatus}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Payment Status:</p>
                <p className="text-gray-900 capitalize">
                  {selectedAppointment.paymentStatus}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Created At:</p>
                <p className="text-gray-900">
                  {moment(selectedAppointment.createdAt).format(
                    "DD-MM-YYYY hh:mm A"
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserAppointments;
