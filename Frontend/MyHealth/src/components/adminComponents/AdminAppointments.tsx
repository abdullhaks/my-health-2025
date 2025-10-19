import { useEffect, useState } from "react";
import { getAppointments } from "../../api/admin/adminApi";
import { Table, Select, DatePicker, Button, Pagination, Modal } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import moment from "moment";

interface Appointment {
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

const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    dateRange: null as [moment.Moment, moment.Moment] | null,
  });
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const fetchAppointments = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAppointments(page, limit, {
        status: filters.status,
        startDate: filters.dateRange
          ? filters.dateRange[0].toISOString()
          : undefined,
        endDate: filters.dateRange
          ? filters.dateRange[1].toISOString()
          : undefined,
      });

      console.log("appo resp is ", response);
      setAppointments(response.appointments);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(currentPage);
  }, [currentPage, filters]);

  const handleFilterChange = (
    key: string,
    value: string | [moment.Moment, moment.Moment] | null
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const columns = [

      {
      title: "Date & Time",
      dataIndex: "date",
      key: "date",
      render: (date: string, record: Appointment) => (
        <span className="text-sm sm:text-base text-blue-700 cursor-pointer "  onClick={() => handleViewDetails(record)}>
          {moment(date).format("MMM DD, YYYY")}{" "}
          {moment(record.start).format("h:mm A")}
        </span>
      ),
    },
    {
      title: "Patient",
      dataIndex: "userName",
      key: "userName",
      render: (userName: string) => (
        <span className="text-sm sm:text-base text-gray-700 truncate">
          {userName}
        </span>
      ),
    },
    {
      title: "Doctor",
      dataIndex: "doctorName",
      key: "doctorName",
      render: (doctorName: string) => (
        <span className="text-sm sm:text-base text-gray-700 truncate">
          Dr. {doctorName}
        </span>
      ),
    },
  
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (duration: number) => (
        <span className="text-sm sm:text-base text-gray-700">
          {duration} mins
        </span>
      ),
    },
    {
      title: "Fee",
      dataIndex: "fee",
      key: "fee",
      render: (fee: number) => (
        <span className="text-sm sm:text-base text-gray-700">Rs {fee}</span>
      ),
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status: string) => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs sm:text-sm font-medium truncate ${
            status === "completed"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    {
      title: "Appointment Status",
      dataIndex: "appointmentStatus",
      key: "appointmentStatus",
      render: (status: string) => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs sm:text-sm font-medium truncate ${
            status === "booked"
              ? "bg-blue-100 text-blue-800"
              : status === "completed"
              ? "bg-green-100 text-green-800"
              : status === "cancelled"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
  ];

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
        Admin Appointments
      </h2>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FilterOutlined className="text-gray-600 text-base" />
            <Select
              placeholder="Filter by Status"
              className="w-full sm:w-48"
              onChange={(value) => handleFilterChange("status", value)}
              allowClear
            >
              <Option value="booked">Booked</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </div>
          {/* Doctor Category Filter - Uncomment if needed 
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FilterOutlined className="text-gray-600 text-base" />
            <Select
              placeholder="Filter by Category"
              className="w-full sm:w-48"
              onChange={(value) => handleFilterChange("doctorCategory", value)}
              allowClear
            >
              <Option value="GENERAL">General</Option>
              <Option value="CARDIOLOGY">Cardiology</Option>
              <Option value="PEDIATRICS">Pediatrics</Option>
              <Option value="DERMATOLOGY">Dermatology</Option>
            </Select>
          </div>
          */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FilterOutlined className="text-gray-600 text-base" />
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
              className="w-full sm:w-auto"
            />
          </div>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => fetchAppointments(currentPage)}
            className="h-10 px-4 text-sm font-medium w-full sm:w-auto"
          >
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <Table
          dataSource={appointments}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={false}
          className="min-w-[800px]"
        />
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-end">
        <Pagination
          current={currentPage}
          total={totalPages * limit}
          pageSize={limit}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          responsive
        />
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
                      className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full object-cover shadow-md"
                    />
                    <div className="text-center sm:text-left">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                        Dr. {selectedAppointment.doctorName}
                      </h4>
                      <p className="text-sm sm:text-base text-gray-600">
                        {selectedAppointment.doctorCategory}
                      </p>
                    </div>

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

export default AdminAppointments;
