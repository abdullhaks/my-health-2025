import { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  FaHome, FaUserMd, FaCalendarAlt, FaUserFriends, FaBell,
  FaCog, FaSignOutAlt, FaBars, FaTimes, FaChevronLeft, FaChevronRight, FaSearch, FaComments, FaPodcast,
  FaCreditCard, FaBlog, FaPlus, FaUsers, FaInfoCircle
} from "react-icons/fa";
import { BiSolidAnalyse } from "react-icons/bi";
import applogoBlue from "../../assets/applogoblue.png";
import appIconSm from "../../assets/app-icon-sm.png";
import ConfirmModal from "../../sharedComponents/ConfirmModal";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../redux/slices/userSlices";
import { logoutUser as logout, getNotifications } from "../../api/user/userApi";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { message } from "antd";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { IUserData } from "../../interfaces/user";

interface Notification {
  _id: string;
  userId: string;
  date: Date;
  message: string;
  isRead: boolean;
  mention?: string;
  link?: string;
  type: "appointment" | "payment" | "blog" | "add" | "newConnection" | "common" | "reportAnalysis";
  createdAt: Date;
}

interface NavbarProps {
  children: React.ReactNode;
}

const Layout: React.FC<NavbarProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const limit = 10;
  const [notificationSet, setNotificationSet] = useState(1);

  const user = useSelector((state: IUserData) => state.user.user);

  const fetchNotifications = async () => {
    if (!user?._id) return;
    try {
      const response = await getNotifications(user._id, limit, notificationSet);

      if (response.notifications.length) {
        console.log("noti respionse are", response);
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n._id));
          const newNotifications = response.notifications
            .map((n: Notification) => ({
              ...n,
              date: new Date(n.createdAt),
              createdAt: new Date(n.createdAt),
            }))
            .filter((n: Notification) => !existingIds.has(n._id));
          return [...newNotifications, ...prev].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        const unreadCount = response.notifications.filter((n: Notification) => !n.isRead).length;
        setNotificationCount(unreadCount);
      } else {
        setNotificationCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      message.error("Failed to load notifications.");
    }
  };

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

      const socket = io(import.meta.env.VITE_REACT_APP_SOCKET_URL || "https://api.abdullhakalamban.online", {
        transports: ["websocket"],
        reconnection: true,
        auth: { token },
      });

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
        }
      });

      socket.on("notification", () => {
        fetchNotifications();
      });

      socket.on("error", ({ message }) => {
        console.error("Socket error:", message);
        message.error(message);
      });
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        socketRef.current.off("notification");
        socketRef.current.off("error");
        socketRef.current.disconnect();
      }
    };
  }, [user?._id]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
        setMobileOpen(false);
      }
    };

    fetchNotifications();
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [user?._id, notificationSet]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    logout();
    navigate("/");
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleMobileLinkClick = () => {
    setMobileOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchInput);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <FaCalendarAlt className="text-blue-500" />;
      case "payment":
        return <FaCreditCard className="text-green-500" />;
      case "blog":
        return <FaBlog className="text-purple-500" />;
      case "add":
        return <FaPlus className="text-orange-500" />;
      case "newConnection":
        return <FaUsers className="text-indigo-500" />;
      case "reportAnalysis":
        return <BiSolidAnalyse className="text-teal-500" />;
      case "common":
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, isRead: true } : n
        )
      );
      setNotificationCount((prev) => prev - 1);
    }

    if (notification.link) {
      navigate(notification.link);
    }

    setShowNotificationDropdown(false);
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `https://api.abdullhakalamban.online/api/user/notifications/read-all`,
        { userId: user._id },
        { withCredentials: true }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setNotificationCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      message.error("Failed to mark all notifications as read.");
    }
  };

  const handleNextPage = () => {
    setNotificationSet((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (notificationSet > 1) {
      setNotificationSet((prev) => prev - 1);
    }
  };

  const menuItems = [
    { name: "Dashboard", path: "/user/dashboard", icon: <FaHome /> },
    { name: "Doctors", path: "/user/doctors", icon: <FaUserMd /> },
    { name: "Appointments", path: "/user/appointments", icon: <FaCalendarAlt /> },
    { name: "Report Analysis", path: "/user/report-analysis", icon: <BiSolidAnalyse /> },
    { name: "Chat", path: "/user/chat", icon: <FaComments /> },
    { name: "MyHealth-Ai", path: "/user/ai", icon: <FaPodcast /> },
    { name: "Blogs", path: "/user/blogs", icon: <FaBlog /> },
    { name: "Transactions", path: "/user/transactions", icon: <FaMoneyBillTransfer /> },
    { name: "My Profile", path: "/user/profile", icon: <FaUserFriends /> },
  ];

  const secondaryMenuItems = [
    { name: "Settings", path: "/user/settings", icon: <FaCog /> },
  ];

  const renderMenuItems = (items: { name: string; path: string; icon: React.ReactNode }[]) => {
    return items.map((item: { name: string; path: string; icon: React.ReactNode }, index: number) => {
      const isActive = location.pathname === item.path;

      return (
        <Link
          to={item.path}
          key={index}
          className={`flex items-center px-3 py-3 mb-2 rounded-lg transition-all duration-200 ${
            isActive
              ? "bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-md"
              : "text-gray-700 hover:bg-blue-50"
          }`}
          onClick={handleMobileLinkClick}
        >
          <span className={`text-lg md:text-xl ${isActive ? "text-white" : "text-blue-800"}`}>{item.icon}</span>
          {!collapsed && (
            <span className="ml-3 text-sm md:text-base font-medium whitespace-nowrap">{item.name}</span>
          )}
          {collapsed && isActive && (
            <div className="absolute left-0 w-1 h-8 bg-cyan-400 rounded-r-full"></div>
          )}
        </Link>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 shadow-xl transition-all duration-300 ${
          collapsed ? "w-20" : "w-56"
        } ${mobileOpen ? "translate-x-0 bg-white" : "-translate-x-full md:translate-x-0 md:bg-white"}`}
      >
        {/* Header with Logo and Close Button */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
          <div className={`${collapsed ? "mx-auto" : "flex items-center"}`}>
            <img
              src={window.innerWidth < 768 ? appIconSm : applogoBlue}
              alt="MyHealth"
              className="h-8 w-auto object-contain md:h-10"
            />
          </div>
          {/* Mobile close button */}
          <button
            className="md:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Content */}
        <div className="h-[calc(100%-64px)] overflow-y-auto py-4 px-3">
          <div className="space-y-4">
            {/* Main Menu */}
            <div className="space-y-1">{renderMenuItems(menuItems)}</div>
            
            {/* Secondary Menu */}
            <div>
              {!collapsed && (
                <h3 className="px-3 mb-2 text-xs uppercase font-semibold text-gray-500">More</h3>
              )}
              <div className="space-y-1">{renderMenuItems(secondaryMenuItems)}</div>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => {
                  handleMobileLinkClick();
                  setShowConfirm(true);
                }}
                className="w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600"
              >
                <span className="text-lg md:text-xl text-red-500">
                  <FaSignOutAlt />
                </span>
                {!collapsed && <span className="ml-3 text-sm md:text-base font-medium">Logout</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop collapse button */}
        <button
          onClick={toggleSidebar}
          className="absolute bottom-4 -right-3 hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-white text-blue-800 border border-blue-200 hover:bg-blue-50 transition-colors shadow-md"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FaChevronRight size={10} /> : <FaChevronLeft size={10} />}
        </button>
      </aside>

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
          collapsed ? "md:ml-20" : "md:ml-56"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-20 h-14 md:h-16 bg-white shadow-md">
          <div className="flex items-center justify-between h-full px-3 md:px-6">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-blue-700 hover:bg-blue-50"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <FaBars className="w-5 h-5" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-auto px-2 md:px-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                  className="w-full py-2 pl-8 pr-4 text-sm rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-blue-800"
                >
                  <FaSearch className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  className="p-2 rounded-full hover:bg-blue-50 text-blue-800 transition-colors"
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                >
                  <FaBell className="w-4 h-4 md:w-5 md:h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotificationDropdown && (
                  <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white rounded-lg shadow-xl border border-gray-300 z-50">
                    <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-100">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800">Notifications</h3>
                      {notificationCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs md:text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 md:max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <FaBell className="mx-auto mb-2 text-xl md:text-2xl" />
                          <p className="text-sm md:text-base">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-3 md:p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.isRead ? "bg-blue-50" : ""
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs md:text-sm ${!notification.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                                  {notification.message}
                                </p>
                                {notification.mention && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    {notification.mention}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="flex-shrink-0">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-100 flex justify-between text-xs md:text-sm">
                        <button
                          onClick={handlePrevPage}
                          className="text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
                          disabled={notificationSet === 1}
                        >
                          Previous
                        </button>
                        <Link
                          to="/user/notifications"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => setShowNotificationDropdown(false)}
                        >
                          View all
                        </Link>
                        <button
                          onClick={handleNextPage}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  className="flex items-center focus:outline-none cursor-pointer"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-blue-600">
                    <img
                      src={user.profile || "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"}
                      alt="User profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-0.5 w-40 md:w-48 bg-gray-200 rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/user/profile"
                      className="block px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-blue-50"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/user/settings"
                      className="block px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-blue-50"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      Settings
                    </Link>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={() => {
                        setShowConfirm(true);
                        setShowProfileDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-xs md:text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pt-4 pb-6 md:pt-6 md:pb-8 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <ConfirmModal
          message="Are you sure you want to log out?"
          onConfirm={handleLogout}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default Layout;