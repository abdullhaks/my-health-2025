import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getDoctorAnalytics, getUserAnalytics, getTotalAnalytics, getTransactions } from "../../api/admin/adminApi";
import adminimg from "../../assets/doctorLogin.png";
import { FaCalendarCheck, FaUsers } from "react-icons/fa";
import { FaMoneyBillTransfer, FaMoneyBillTrendUp, FaUserDoctor } from "react-icons/fa6";
import { Table, DatePicker, Button, Pagination, Tag, message } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SummaryCardProps {
  title: string;
  value: string;
  trend: string;
  trendColor: string;
  icon?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, trend, trendColor, icon }) => (
  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md flex flex-col gap-3 transition-transform transform hover:scale-105">
    <div className="flex justify-between items-center">
      <h4 className="text-sm sm:text-base font-semibold text-gray-700 truncate">{title}</h4>
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center">
        {icon || <span className="text-lg sm:text-xl">📊</span>}
      </div>
    </div>
    <div className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{value}</div>
    <div className={`text-xs sm:text-sm font-medium ${trendColor}`}>{trend}</div>
  </div>
);

interface AnalyticsItem {
  name: string;
  value: number;
}

interface CombinedAnalyticsItem {
  name: string;
  users: number;
  doctors: number;
}

interface TotalAnalytics {
  totalConsultations: number;
  totalDoctors: number;
  totalPaid: number;
  totalRevenue: number;
  totalUsers: number;
}

interface Transaction {
  _id: string;
  createdAt: string;
  method: string;
  amount: number;
  paymentFor: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  totalPages: number;
}

interface Filters {
  dateRange: [Dayjs, Dayjs] | null;
}

const AdminDashboard = () => {
  const [userData, setUserData] = useState<AnalyticsItem[]>([]);
  const [doctorData, setDoctorData] = useState<AnalyticsItem[]>([]);
  const [combinedData, setCombinedData] = useState<CombinedAnalyticsItem[]>([]);
  const [analyticsFilter, setAnalyticsFilter] = useState("day");
  const [totaldata, setTotalData] = useState<TotalAnalytics>({
    totalConsultations: 0,
    totalDoctors: 0,
    totalPaid: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(2);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    dateRange: null,
  });
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's 'sm' breakpoint
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchTotalAnalytics = async () => {
      try {
        const response: TotalAnalytics = await getTotalAnalytics();
        setTotalData(response);
      } catch (error) {
        console.error("Failed to fetch total analytics:", error);
      }
    };
    fetchTotalAnalytics();
  }, []);

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      try {
        const response: AnalyticsItem[] = await getUserAnalytics(analyticsFilter);
        setUserData(response);
      } catch (error) {
        console.error("Failed to fetch user analytics:", error);
      }
    };
    fetchUserAnalytics();
  }, [analyticsFilter]);

  useEffect(() => {
    const fetchDoctorAnalytics = async () => {
      try {
        const response: AnalyticsItem[] = await getDoctorAnalytics(analyticsFilter);
        setDoctorData(response);
      } catch (error) {
        console.error("Failed to fetch doctor analytics:", error);
      }
    };
    fetchDoctorAnalytics();
  }, [analyticsFilter]);

  useEffect(() => {
    if (userData.length > 0 && doctorData.length > 0 && userData.length === doctorData.length) {
      const combined: CombinedAnalyticsItem[] = userData.map((u, i) => ({
        name: u.name,
        users: u.value,
        doctors: doctorData[i].value,
      }));
      setCombinedData(combined);
    } else {
      setCombinedData([]);
    }
  }, [userData, doctorData]);

  const fetchTransactions = async (page: number) => {
    setLoading(true);
    try {
      const response: TransactionsResponse = await getTransactions(page, limit, {
        startDate: filters.dateRange ? filters.dateRange[0].toISOString() : undefined,
        endDate: filters.dateRange ? filters.dateRange[1].toISOString() : undefined,
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

  const handleFilterChange = (key: keyof Filters, value: [Dayjs, Dayjs] | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleDownload = async () => {
    if (!filters.dateRange) {
      message.warning("Please select a date range to download.");
      return;
    }
    try {
      const response: TransactionsResponse = await getTransactions(1, 10000, {
        startDate: filters.dateRange[0].toISOString(),
        endDate: filters.dateRange[1].toISOString(),
      });
      const allTransactions = response.transactions;

      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Date', 'Method', 'Amount', 'Payment For']],
        body: allTransactions.map((t: Transaction) => [
          dayjs(t.createdAt).format("MMM DD, YYYY h:mm A"),
          t.method,
          `Rs ${t.amount}`,
          t.paymentFor,
        ]),
      });
      doc.save(`admin_revenue_${dayjs().format('YYYYMMDD')}.pdf`);
    } catch (err) {
      console.error("Error downloading PDF:", err);
    }
  };

  // Format axis label based on filter
  const formatAxisLabel = (value: string) => {
    if (analyticsFilter === "day") {
      return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    } else if (analyticsFilter === "month" && isMobile) {
      const [month, year] = value.split("-");
      const date = new Date(`${month}-01-${year}`);
      const monthName = date.toLocaleDateString("en-GB", { month: "short" });
      return monthName;
    } else if (analyticsFilter === "month") {
      return new Date(value + "-01").toLocaleDateString("en-GB", { month: "short" });
    } else {
      return value;
    }
  };

  // Dynamic chart height and font sizes
  const chartHeight = isMobile ? 200 : window.innerWidth < 1024 ? 250 : 300;
  const axisFontSize = isMobile ? 10 : window.innerWidth < 1024 ? 12 : 14;
  const tooltipFontSize = isMobile ? 12 : 14;

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden shadow-lg bg-gradient-to-r from-blue-600 to-cyan-500 h-48 sm:h-64 lg:h-80">
        <div className="flex items-center h-full px-4 sm:px-6 lg:px-8">
          <div className="z-10 text-white space-y-2 max-w-lg">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
              Aster MIMS Hospitals
            </h2>
            <p className="text-sm sm:text-base font-medium">We’ll Treat You Well</p>
            <p className="text-xs sm:text-sm">www.asterhospitals.in</p>
            <p className="text-xs sm:text-sm">+91 3434 5656 999</p>
          </div>
          <img
            src={adminimg}
            alt="Doctors"
            className="absolute bottom-0 right-0 h-full w-auto object-contain max-w-[50%] sm:max-w-[40%] lg:max-w-[30%] opacity-90"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        <SummaryCard
          title="Total Users"
          value={totaldata.totalUsers.toString()}
          trend="8.5% Up from yesterday"
          trendColor="text-green-600"
          icon={<FaUsers className="text-xl sm:text-2xl text-green-600" />}
        />
        <SummaryCard
          title="Total Doctors"
          value={totaldata.totalDoctors.toString()}
          trend="1.3% Up from past week"
          trendColor="text-green-600"
          icon={<FaUserDoctor className="text-xl sm:text-2xl text-green-600" />}
        />
        <SummaryCard
          title="Total Revenue"
          value={totaldata.totalRevenue.toString()}
          trend="4.3% Down from yesterday"
          trendColor="text-red-600"
          icon={<FaMoneyBillTrendUp className="text-xl sm:text-2xl text-red-600" />}
        />
        <SummaryCard
          title="Total Paid"
          value={totaldata.totalPaid.toString()}
          trend="1.8% Up from yesterday"
          trendColor="text-green-600"
          icon={<FaMoneyBillTransfer className="text-xl sm:text-2xl text-green-600" />}
        />
        <SummaryCard
          title="Total Consultations"
          value={totaldata.totalConsultations.toString()}
          trend="8.5% Up from yesterday"
          trendColor="text-green-600"
          icon={<FaCalendarCheck className="text-xl sm:text-2xl text-green-600" />}
        />
      </div>

      {/* Transaction Listing */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Admin Revenue Transactions</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
            <div className="flex items-center gap-2">
              <FilterOutlined className="text-gray-600" />
              <DatePicker.RangePicker
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    handleFilterChange("dateRange", [dates[0], dates[1]]);
                  } else {
                    handleFilterChange("dateRange", null);
                  }
                }}
                format="YYYY-MM-DD"
                className="w-full sm:w-auto"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => fetchTransactions(currentPage)}
                className="h-10 px-4 text-sm font-medium"
              >
                Apply Filters
              </Button>
              <Button
                onClick={handleDownload}
                className="h-10 px-4 text-sm font-medium"
              >
                Download PDF
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table
              dataSource={transactions}
              columns={[
                {
                  title: "Date",
                  dataIndex: "createdAt",
                  key: "createdAt",
                  render: (date: string) => dayjs(date).format("MMM DD, YYYY h:mm A"),
                },
                {
                  title: "Method",
                  dataIndex: "method",
                  key: "method",
                },
                {
                  title: "Amount",
                  dataIndex: "amount",
                  key: "amount",
                  render: (amount: number) => `Rs ${amount}`,
                },
                {
                  title: "Payment For",
                  dataIndex: "paymentFor",
                  key: "paymentFor",
                  render: (text: string) => (
                    <Tag
                      color="blue"
                      className="text-xs sm:text-sm font-medium truncate"
                    >
                      {text.toUpperCase()}
                    </Tag>
                  ),
                },
              ]}
              rowKey="_id"
              loading={loading}
              pagination={false}
              className="min-w-[600px]"
            />
          </div>
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
      </div>

      {/* Analytics Chart */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">User & Doctor Analytics</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Track user and doctor trends over time</p>
            </div>
            <select
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              value={analyticsFilter}
              onChange={(e) => setAnalyticsFilter(e.target.value)}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>
        <div className="p-4 sm:p-6 overflow-x-auto snap-x snap-mandatory">
          <div className="min-w-[280px] sm:min-w-[400px] lg:min-w-[600px] max-w-full">
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart
                data={combinedData.length > 0 ? combinedData : [{ name: "", users: 0, doctors: 0 }]}
                margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
              >
                <XAxis
                  dataKey="name"
                  tickFormatter={formatAxisLabel}
                  stroke="#64748b"
                  fontSize={axisFontSize}
                  tick={{ fontSize: axisFontSize }}
                  interval={isMobile ? 0 : undefined}
                />
                <YAxis stroke="#64748b" fontSize={axisFontSize} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: tooltipFontSize,
                    padding: isMobile ? "8px" : "10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: isMobile ? 10 : 20, fontSize: axisFontSize }} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={isMobile ? 2 : 3}
                  dot={{ r: isMobile ? 3 : 5, fill: "#3b82f6", strokeWidth: 1, stroke: "#fff" }}
                  activeDot={{ r: isMobile ? 5 : 6, fill: "#1d4ed8", strokeWidth: 1, stroke: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="doctors"
                  stroke="#10b981"
                  strokeWidth={isMobile ? 2 : 3}
                  dot={{ r: isMobile ? 3 : 5, fill: "#10b981", strokeWidth: 1, stroke: "#fff" }}
                  activeDot={{ r: isMobile ? 5 : 6, fill: "#059669", strokeWidth: 1, stroke: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;