import { FaVideo } from "react-icons/fa";
import { FaNotesMedical } from "react-icons/fa6";
import adminimg from "../../assets/doctorLogin.png";
import {
  getDashboardContent,
  getDoctorAppointmentsStats,
  getDoctorReportsStats,
  getDoctorPayouts,
} from "../../api/doctor/doctorApi";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { IDoctorData } from "../../interfaces/doctor";

const DoctorDashboard = () => {
  const doctor = useSelector((state: IDoctorData) => state.doctor.doctor);

  // Dashboard data
  const [dashboardData, setDashboardData] = useState<{
    upcomingAppointmentsCount: [string, number][];
    todayAppointmentsCount: number;
    pendingReportsCount: number;
    todaysFirstAppointmentTime: string | null;
  } | null>(null);

  // Graph & tables data
  const [appointmentsStats, setAppointmentsStats] = useState<
    { day: string; appointments: number }[]
  >([]);
  const [reportsStats, setReportsStats] = useState<
    { day: string; pending: number; submitted: number }[]
  >([]);
  const [payouts, setPayouts] = useState<
    { on: string; totalAmount: number; status: string; transactionId: string }[]
  >([]);
  const [filter, setFilter] = useState<"day" | "month" | "year">("day");
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
    const fetchDashboardData = async () => {
      try {
        const resp = await getDashboardContent(doctor._id);
        setDashboardData(resp);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    const fetchStats = async () => {
      try {
        const appStats = await getDoctorAppointmentsStats(doctor._id, filter);
        const repStats = await getDoctorReportsStats(doctor._id, filter);
        const pay = await getDoctorPayouts(doctor._id);

        setAppointmentsStats(appStats.data);
        setReportsStats(repStats.data);
        setPayouts(pay.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchDashboardData();
    fetchStats();
  }, [doctor._id, filter]);

  // Group months for mobile view (Jan-Feb, Mar-Apr, etc.)
  const groupedAppointmentsStats = useMemo(() => {
    if (filter !== "month" || !isMobile) return appointmentsStats;

    const grouped = [];
    for (let i = 0; i < appointmentsStats.length; i += 2) {
      const first = appointmentsStats[i];
      const second = appointmentsStats[i + 1];
      const month1 = new Date(first.day + "-01").toLocaleDateString("en-GB", {
        month: "short",
      });
      if (second) {
        const month2 = new Date(second.day + "-01").toLocaleDateString(
          "en-GB",
          { month: "short" }
        );
        grouped.push({
          day: `${month1}-${month2}`,
          appointments: first.appointments + (second.appointments || 0),
        });
      } else {
        grouped.push({ ...first, day: month1 });
      }
    }
    return grouped;
  }, [appointmentsStats, filter, isMobile]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        weekday: "short",
        timeZone: "Asia/Kolkata",
      })
      .replace(/,/, "");
  };

  // Format time for display
  const formatTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  // Format axis label based on filter
  const formatAxisLabel = (value: string) => {
    if (filter === "day") {
      return new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
    } else if (filter === "month" && isMobile) {
      return value; // Use grouped month labels (e.g., "Jan-Feb")
    } else if (filter === "month") {
      return new Date(value + "-01").toLocaleDateString("en-GB", {
        month: "short",
      });
    } else {
      return value;
    }
  };

  const todayDate = new Date()
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      weekday: "short",
      timeZone: "Asia/Kolkata",
    })
    .replace(/,/, "");

  // Dynamic chart height based on screen size
  const chartHeight = isMobile ? 200 : window.innerWidth < 1024 ? 250 : 300;

  // Dynamic font sizes
  const axisFontSize = isMobile ? 4 : window.innerWidth < 1024 ? 12 : 14;
  const tooltipFontSize = isMobile ? 12 : 14;

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Hero Card */}
        <div className="relative flex-1 rounded-xl overflow-hidden shadow-lg bg-gradient-to-r from-blue-600 to-cyan-500 h-64 sm:h-80 lg:h-96 flex items-center px-4 sm:px-6">
          <div className="z-10 text-white space-y-2">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              Aster MIMS HOSPITALS
            </h2>
            <p className="text-sm sm:text-base font-medium">
              We'll Treat You Well
            </p>
            <p className="text-xs sm:text-sm">www.asterhospitals.in</p>
            <p className="text-xs sm:text-sm">+91 3434 5656 999</p>
          </div>
          <img
            src={adminimg}
            alt="Hospital Banner"
            className="absolute bottom-0 right-0 h-full w-auto object-contain max-w-[50%] sm:max-w-[40%] lg:max-w-[30%]"
          />
        </div>

        {/* Upcoming Appointments */}
        <div className="w-full lg:w-80 rounded-xl shadow-lg bg-white p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
            Upcoming Appointments
          </h3>
          <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
            {dashboardData?.upcomingAppointmentsCount.map(
              ([date, count], index) => {
                const isToday = date === new Date().toISOString().split("T")[0];
                return (
                  <div
                    key={date || index}
                    className={`rounded-lg px-3 py-2 sm:px-4 sm:py-3 flex justify-between items-center ${
                      isToday ? "bg-red-50" : "bg-gray-50"
                    } hover:bg-gray-100 transition-colors`}
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700">
                        {formatDate(date).split(" ")[1]}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">
                        {formatDate(date).split("-")[0]}
                      </p>
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm font-medium">
                      {count}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Today's Updates */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
          Today's Updates{" "}
          <span className="text-xs sm:text-sm text-gray-500">{todayDate}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-green-500 text-white p-4 sm:p-6 rounded-xl shadow-lg flex items-center justify-between hover:bg-green-600 transition-colors">
            <div className="flex items-center gap-3 sm:gap-4">
              <FaVideo className="text-xl sm:text-2xl" />
              <div>
                <p className="text-sm sm:text-base font-medium">
                  Online Consultations
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {dashboardData?.todayAppointmentsCount || 0}
                </p>
                <p className="text-xs sm:text-sm mt-1">
                  Start from:{" "}
                  {dashboardData?.todaysFirstAppointmentTime
                    ? formatTime(dashboardData.todaysFirstAppointmentTime)
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-500 text-white p-4 sm:p-6 rounded-xl shadow-lg flex items-center justify-between hover:bg-orange-600 transition-colors">
            <div className="flex items-center gap-3 sm:gap-4">
              <FaNotesMedical className="text-xl sm:text-2xl" />
              <div>
                <p className="text-sm sm:text-base font-medium">
                  Report Analysis
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {dashboardData?.pendingReportsCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {["day", "month", "year"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as "day" | "month" | "year")}
            className={`px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base font-medium transition-colors min-w-[80px] ${
              filter === f
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Charts Section */}
      <div className="space-y-6 sm:space-y-8">
        {/* Appointments Overview */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Appointments Overview
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Track your appointment trends
            </p>
          </div>
          <div className="p-4 sm:p-5 overflow-x-auto snap-x snap-mandatory">
            <div className="min-w-[280px] sm:min-w-[400px] lg:min-w-[600px] max-w-full">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  data={groupedAppointmentsStats}
                  margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
                >
                  <XAxis
                    dataKey="day" 
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
                  <Bar
                    dataKey="appointments"
                    fill="url(#appointmentsGradient)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={isMobile ? 40 : 60}
                  />
                  <defs>
                    <linearGradient
                      id="appointmentsGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Appointments Trend */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Appointments Trend
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Monitor appointment patterns over time
            </p>
          </div>
          <div className="p-4 sm:p-5 overflow-x-auto snap-x snap-mandatory">
            <div className="min-w-[280px] sm:min-w-[400px] lg:min-w-[600px] max-w-full">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart
                  data={groupedAppointmentsStats}
                  margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
                >
                  <XAxis
                    dataKey="day"
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
                  <Legend
                    wrapperStyle={{
                      paddingTop: isMobile ? 10 : 20,
                      fontSize: axisFontSize,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="appointments"
                    stroke="#3b82f6"
                    strokeWidth={isMobile ? 2 : 3}
                    dot={{
                      r: isMobile ? 3 : 4,
                      fill: "#3b82f6",
                      strokeWidth: 1,
                      stroke: "#fff",
                    }}
                    activeDot={{
                      r: isMobile ? 5 : 6,
                      fill: "#1d4ed8",
                      strokeWidth: 1,
                      stroke: "#fff",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Reports Analysis */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Reports Analysis
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Compare pending vs submitted reports
            </p>
          </div>
          <div className="p-4 sm:p-5 overflow-x-auto snap-x snap-mandatory">
            <div className="min-w-[280px] sm:min-w-[400px] lg:min-w-[600px] max-w-full">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  data={reportsStats}
                  margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
                >
                  <XAxis
                    dataKey="day"
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
                  <Legend
                    wrapperStyle={{
                      paddingTop: isMobile ? 10 : 20,
                      fontSize: axisFontSize,
                    }}
                  />
                  <Bar
                    dataKey="pending"
                    fill="#f97316"
                    name="Pending"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={isMobile ? 30 : 40}
                  />
                  <Bar
                    dataKey="submitted"
                    fill="#10b981"
                    name="Submitted"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={isMobile ? 30 : 40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
          Payouts
        </h3>
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 sm:p-4 text-left font-semibold">Date</th>
                <th className="p-3 sm:p-4 text-left font-semibold">Amount</th>
                <th className="p-3 sm:p-4 text-left font-semibold">Status</th>
                <th className="p-3 sm:p-4 text-left font-semibold">
                  Transaction Id
                </th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 sm:p-4 text-gray-700">
                    {formatDate(p.on)}
                  </td>
                  <td className="p-3 sm:p-4 text-gray-700">
                    ₹{p.totalAmount.toLocaleString()}
                  </td>
                  <td className="p-3 sm:p-4 text-gray-700">
                    <span
                      className={`inline-flex px-2 py-1 text-xs sm:text-sm font-semibold rounded-full ${
                        p.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : p.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-gray-700 truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">
                    {p.transactionId || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
