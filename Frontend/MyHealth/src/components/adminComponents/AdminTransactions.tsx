
import moment from "moment";
import ReusableTable from "../../sharedComponents/table";
import { getTransactions } from "../../api/admin/adminApi";

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

const AdminTransactions = () => {
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

  interface TransactionFilters {
    method?: string;
    paymentFor?: string;
    dateRange?: [Date, Date] | undefined | null;
  }

  const fetchData = async (page: number, limit: number, filters: TransactionFilters = {}) => {
    const response = await getTransactions(page, limit, {
      method: filters.method || "",
      paymentFor: filters.paymentFor || "",
      startDate: filters.dateRange ? filters.dateRange[0].toISOString() : undefined,
      endDate: filters.dateRange ? filters.dateRange[1].toISOString() : undefined,
    });
    return { data: response.transactions, totalPages: response.totalPages };
  };

  return (
    <ReusableTable<Transaction>
      title="Admin Transactions"
      columns={columns}
      fetchData={fetchData}
      filterOptions={[
        {
          key: "method",
          type: "select",
          placeholder: "Filter by Method",
          options: [
            { value: "stripe", label: "Stripe" },
            { value: "wallet", label: "Wallet" },
            { value: "bank", label: "Bank" },
          ],
        },
        {
          key: "paymentFor",
          type: "select",
          placeholder: "Filter by Purpose",
          options: [
            { value: "subscription", label: "Subscription" },
            { value: "appointment", label: "Appointment" },
            { value: "analysis", label: "Analysis" },
            { value: "refund", label: "Refund" },
            { value: "salary", label: "Salary" },
          ],
        },
        {
          key: "dateRange",
          type: "dateRange",
        },
      ]}
      rowKey="_id"
      limit={5}
      tableClassName="min-w-[800px]"
    />
  );
};

export default AdminTransactions;
