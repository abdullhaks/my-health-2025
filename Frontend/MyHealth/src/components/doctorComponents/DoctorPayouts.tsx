import { useEffect, useState } from "react";
import { getPayouts } from "../../api/doctor/doctorApi";
import { Table, Select, DatePicker, Button, Pagination } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import moment from "moment";
import { useSelector } from "react-redux";
import { IDoctorData } from "../../interfaces/doctor";

interface Transaction {
  _id: string;
  bankAccNo: string;
  bankAccHolderName: string;
  bankIfscCode: string;
  totalAmount: number;
  paid: number;
  serviceAmount: number;
  status: string;
  transactionId?: string;
  invoiceLink?: string;
  createdAt: string;
  updatedAt: string;
}

const { Option } = Select;
const { RangePicker } = DatePicker;

const DoctorPayouts = () => {
  const doctor = useSelector((state: IDoctorData) => state.doctor.doctor);
  const doctorId = doctor._id;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(3);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    dateRange: null as [moment.Moment, moment.Moment] | null,
  });

  const fetchTransactions = async (page: number) => {
    setLoading(true);
    try {
      const response = await getPayouts(doctorId, page, limit, {
        status: filters.status,
        startDate: filters.dateRange ? filters.dateRange[0].toISOString() : undefined,
        endDate: filters.dateRange ? filters.dateRange[1].toISOString() : undefined,
      });
      setTransactions(response.payouts);
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

  const handleFilterChange = (key: string, value: string | [moment.Moment, moment.Moment] | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date: string) => moment(date).format("DD-MM-YYYY, hh:mm A"),
    },
    {
      title: "Acc.No",
      dataIndex: "bankAccNo",
      key: "bankAccNo",
      render: (text: string) => (
        <span className="truncate block max-w-[150px] sm:max-w-[200px]">{text}</span>
      ),
    },
    {
      title: "Acc.Holder",
      dataIndex: "bankAccHolderName",
      key: "bankAccHolderName",
      render: (text: string) => (
        <span className="truncate block max-w-[150px] sm:max-w-[200px]">{text}</span>
      ),
    },
    {
      title: "IFSC",
      dataIndex: "bankIfscCode",
      key: "bankIfscCode",
      render: (text: string) => (
        <span className="truncate block max-w-[100px] sm:max-w-[150px]">{text}</span>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `Rs ${amount}`,
    },
    {
      title: "Paid",
      dataIndex: "paid",
      key: "paid",
      render: (amount: number) => `Rs ${amount}`,
    },
    {
      title: "Service Amount",
      dataIndex: "serviceAmount",
      key: "serviceAmount",
      render: (amount: number) => `Rs ${amount}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => (
        <span className={`capitalize ${text === 'paid' ? 'text-green-600' : text === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
          {text}
        </span>
      ),
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      render: (text: string) => (
        <span className="truncate block max-w-[100px] sm:max-w-[150px]">{text || "N/A"}</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-4 sm:mb-6">
        My Payouts
      </h2>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 sm:p-6 rounded-xl shadow-lg flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FilterOutlined className="text-gray-600 text-lg" />
          <Select
            placeholder="Filter by Status"
            className="w-full sm:w-48 md:w-56"
            onChange={(value) => handleFilterChange("status", value)}
            allowClear
          >
            <Option value="requested">Requested</Option>
            <Option value="paid">Paid</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FilterOutlined className="text-gray-600 text-lg" />
          <RangePicker
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                handleFilterChange("dateRange", [moment(dates[0].toDate()), moment(dates[1].toDate())]);
              } else {
                handleFilterChange("dateRange", null);
              }
            }}
            format="DD-MM-YYYY"
            className="w-full sm:w-64 md:w-72"
          />
        </div>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={() => fetchTransactions(currentPage)}
          className="w-full sm:w-auto h-10 sm:h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center min-w-[120px] min-h-[44px]"
        >
          Apply Filters
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="hidden md:block">
          <Table
            dataSource={transactions}
            columns={columns}
            rowKey="_id"
            loading={loading}
            pagination={false}
            className="w-full"
          />
        </div>
        {/* Mobile Card Layout */}
        <div className="md:hidden divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="p-4 sm:p-5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Date</span>
                  <span className="text-sm text-gray-900">{moment(transaction.createdAt).format("DD-MM-YYYY, hh:mm A")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Acc.No</span>
                  <span className="text-sm text-gray-900 truncate max-w-[150px]">{transaction.bankAccNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Acc.Holder</span>
                  <span className="text-sm text-gray-900 truncate max-w-[150px]">{transaction.bankAccHolderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">IFSC</span>
                  <span className="text-sm text-gray-900 truncate max-w-[100px]">{transaction.bankIfscCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Total</span>
                  <span className="text-sm text-gray-900">Rs {transaction.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Paid</span>
                  <span className="text-sm text-gray-900">Rs {transaction.paid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Service Amount</span>
                  <span className="text-sm text-gray-900">Rs {transaction.serviceAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <span className={`text-sm capitalize ${transaction.status === 'paid' ? 'text-green-600' : transaction.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {transaction.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Transaction ID</span>
                  <span className="text-sm text-gray-900 truncate max-w-[100px]">{transaction.transactionId || "N/A"}</span>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="p-4 sm:p-5 text-center text-gray-500 text-sm">Loading...</div>
          )}
          {!loading && transactions.length === 0 && (
            <div className="p-4 sm:p-5 text-center text-gray-500 text-sm">No transactions found</div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 sm:mt-6 flex justify-end">
        <Pagination
          current={currentPage}
          total={totalPages * limit}
          pageSize={limit}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          className="flex items-center gap-2"
          
        />
      </div>
    </div>
  );
};

export default DoctorPayouts;