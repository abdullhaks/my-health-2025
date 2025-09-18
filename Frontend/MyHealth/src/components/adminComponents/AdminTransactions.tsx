import { useEffect, useState } from "react";
import { getTransactions } from "../../api/admin/adminApi";
import { Table, Select, DatePicker, Button, Pagination } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import moment from "moment";

interface Transaction {
  _id: string;
  from: string;
  to: string;
  method: string;
  amount: number;
  paymentFor: string;
  transactionId?: string;
  invoice?: string;
  userId?: string;
  doctorId?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    method: "",
    paymentFor: "",
    dateRange: null as [moment.Moment, moment.Moment] | null,
  });

  const fetchTransactions = async (page: number) => {
    setLoading(true);
    try {
      const response = await getTransactions(page, limit, {
        method: filters.method,
        paymentFor: filters.paymentFor,
        startDate: filters.dateRange
          ? filters.dateRange[0].toISOString()
          : undefined,
        endDate: filters.dateRange
          ? filters.dateRange[1].toISOString()
          : undefined,
      });
      setTransactions(response.transactions);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage, filters]);

  const handleFilterChange = (
    key: string,
    value: string | [moment.Moment, moment.Moment] | null
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (
        <span className="text-sm sm:text-base text-gray-700">
          {moment(date).format("MMM DD, YYYY h:mm A")}
        </span>
      ),
    },
    {
      title: "From",
      dataIndex: "from",
      key: "from",
      render: (text: string) => (
        <span className="text-sm sm:text-base text-gray-700 truncate">
          {text.charAt(0).toUpperCase() + text.slice(1)}
        </span>
      ),
    },
    {
      title: "To",
      dataIndex: "to",
      key: "to",
      render: (text: string) => (
        <span className="text-sm sm:text-base text-gray-700 truncate">
          {text.charAt(0).toUpperCase() + text.slice(1)}
        </span>
      ),
    },
    {
      title: "Method",
      dataIndex: "method",
      key: "method",
      render: (text: string) => (
        <span className="text-sm sm:text-base text-gray-700 truncate">
          {text.charAt(0).toUpperCase() + text.slice(1)}
        </span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <span className="text-sm sm:text-base text-gray-700">Rs {amount}</span>
      ),
    },
    {
      title: "Purpose",
      dataIndex: "paymentFor",
      key: "paymentFor",
      render: (text: string) => (
        <span className="text-sm sm:text-base text-gray-700 truncate">
          {text.charAt(0).toUpperCase() + text.slice(1)}
        </span>
      ),
    },

    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      render: (text: string, record: Transaction) =>
        record.invoice ? (
          <a
            href={record.invoice}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm sm:text-base underline transition-colors"
          >
            {text || "View"}
          </a>
        ) : (
          <span className="text-sm sm:text-base text-gray-700">
            {text || "N/A"}
          </span>
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
        Admin Transactions
      </h2>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FilterOutlined className="text-gray-600 text-base" />
            <Select
              placeholder="Filter by Method"
              className="w-full sm:w-48"
              onChange={(value) => handleFilterChange("method", value)}
              allowClear
            >
              <Option value="stripe">Stripe</Option>
              <Option value="wallet">Wallet</Option>
              <Option value="bank">Bank</Option>
            </Select>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FilterOutlined className="text-gray-600 text-base" />
            <Select
              placeholder="Filter by Purpose"
              className="w-full sm:w-48"
              onChange={(value) => handleFilterChange("paymentFor", value)}
              allowClear
            >
              <Option value="subscription">Subscription</Option>
              <Option value="appointment">Appointment</Option>
              <Option value="analysis">Analysis</Option>
              <Option value="refund">Refund</Option>
              <Option value="salary">Salary</Option>
            </Select>
          </div>
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
            onClick={() => fetchTransactions(currentPage)}
            className="w-full sm:w-auto h-10 px-4 text-sm sm:text-base font-medium"
          >
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <Table
          dataSource={transactions}
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

export default AdminTransactions;
