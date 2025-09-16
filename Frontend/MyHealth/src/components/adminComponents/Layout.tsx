import { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  FaHome, FaUserMd, FaUsers, FaSignOutAlt, FaBars, FaTimes, FaChevronLeft,
  FaChevronRight, FaStar, FaCalendarAlt,
} from "react-icons/fa";
import { MdAttachMoney } from "react-icons/md";
import applogoBlue from "../../assets/applogoblue.png";
import appIconSm from "../../assets/app-icon-sm.png";
import defaultAvatar from "../../assets/avatar.png";
import ConfirmModal from "../../sharedComponents/ConfirmModal";
import { useDispatch } from "react-redux";
import { logoutAdmin } from "../../redux/slices/adminSlices";
import { FaMoneyBillTransfer } from "react-icons/fa6";

interface NavbarProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<NavbarProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // const [notificationCount] = useState(3);
  // const [messageCount] = useState(2);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutAdmin());
    navigate("/admin/login");
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleMobileLinkClick = () => {
    if (window.innerWidth < 768 && mobileOpen) {
      setMobileOpen(false);
    }
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FaHome /> },
    { name: "Users", path: "/admin/users", icon: <FaUsers /> },
    { name: "Doctors", path: "/admin/doctors", icon: <FaUserMd /> },
    { name: "Plans", path: "/admin/subscriptionPlans", icon: <FaStar /> },
    { name: "Appointments", path: "/admin/appointments", icon: <FaCalendarAlt /> },
    { name: "Payouts", path: "/admin/payout", icon: <MdAttachMoney /> },
    { name: "Revenue", path: "/admin/transactions", icon: <FaMoneyBillTransfer /> },
  ];

  interface IMenuItem { name: string; path: string; icon: React.ReactNode }
  const renderMenuItems = (items: IMenuItem[]) => {
    return items.map((item: IMenuItem, index: number) => {
      const isActive = location.pathname === item.path;
      return (
        <Link
          to={item.path}
          key={index}
          className={`relative flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium ${
            isActive
              ? "bg-green-600 text-white shadow-md"
              : "text-gray-600 hover:bg-green-50 hover:text-green-700"
          }`}
          onClick={handleMobileLinkClick}
        >
          <span className={`text-lg sm:text-xl ${isActive ? "text-white" : "text-green-600"}`}>{item.icon}</span>
          {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
          {collapsed && isActive && (
            <div className="absolute left-0 w-1 h-full bg-green-400 rounded-r-full"></div>
          )}
        </Link>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-green-600 text-white shadow-md md:hidden"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white z-40 shadow-lg transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <img
              src={window.innerWidth < 768 ? appIconSm : applogoBlue}
              alt="AdminLogo"
              className="h-8 w-auto object-contain sm:h-10"
            />
            {!collapsed && (
              <h1 className="ml-3 text-lg font-semibold text-gray-800">Admin</h1>
            )}
          </div>
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          {renderMenuItems(menuItems)}
          <div className="border-t border-gray-200 my-4"></div>
          <button
            onClick={() => { handleMobileLinkClick(); setShowConfirm(true); }}
            className="w-full flex items-center px-4 py-3 rounded-lg text-sm sm:text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <span className="text-lg sm:text-xl text-red-600">
              <FaSignOutAlt />
            </span>
            {!collapsed && <span className="ml-3 truncate">Logout</span>}
          </button>
        </nav>

        {/* Collapse Button (Desktop) */}
        <button
          onClick={toggleSidebar}
          className="absolute bottom-4 -right-3 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white text-green-600 border border-green-200 hover:bg-green-50 transition-colors shadow-md"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FaChevronRight className="w-4 h-4" /> : <FaChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-64"}`}>
        {/* Header */}
        <header className="sticky top-0 z-20 h-16 bg-white shadow-md">
          <div className="flex items-center justify-between h-full px-4 sm:px-6">
            <div className="flex-1"></div> {/* Placeholder for removed search bar */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-green-50 text-green-600 transition-colors"
                  aria-label="Notifications"
                >
                  <FaBell className="w-5 h-5 sm:w-6 sm:h-6" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </button>
              </div>
              <div className="relative hidden sm:block">
                <button
                  className="p-2 rounded-full hover:bg-green-50 text-green-600 transition-colors"
                  aria-label="Messages"
                >
                  <FaEnvelope className="w-5 h-5 sm:w-6 sm:h-6" />
                  {messageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                      {messageCount > 9 ? "9+" : messageCount}
                    </span>
                  )}
                </button>
              </div> */}
              <div className="relative" ref={profileRef}>
                <button
                  className="flex items-center focus:outline-none"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  aria-label="Profile"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-green-500">
                    <img
                      src={defaultAvatar}
                      alt="Admin profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/admin/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      Settings
                    </Link>
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={() => {
                        setShowConfirm(true);
                        setShowProfileDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
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
        <main className="flex-1 pt-4 pb-8 sm:pt-6 sm:pb-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
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

export default AdminLayout;