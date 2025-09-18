import { useEffect, useState } from "react";
import { getAppointments } from "../../api/admin/adminApi";
import { Table, Select, DatePicker, Button, Pagination } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import moment from "moment";

interface Appointment {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  doctorId: string;
  doctorName: string;
  doctorCategory: string;
  date: string;
  start: string;
  end: string;
  duration: number;
  fee: number;
  paymentStatus: string;
  paymentType: string;
  appointmentStatus: string;
  callStartTime?: string;
  createdAt: string;
  updatedAt: string;
  slotId: string;
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
      title: "Date & Time",
      dataIndex: "date",
      key: "date",
      render: (date: string, record: Appointment) => (
        <span className="text-sm sm:text-base text-gray-700">
          {moment(date).format("MMM DD, YYYY")}{" "}
          {moment(record.start).format("h:mm A")}
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
    </div>
  );
};

export default AdminAppointments;
