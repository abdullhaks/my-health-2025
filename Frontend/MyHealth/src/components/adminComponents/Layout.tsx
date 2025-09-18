import { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserMd,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaCalendarAlt,
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
        setMobileOpen(false);
      } else {
        setMobileOpen(false);
        setCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
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
    {
      name: "Appointments",
      path: "/admin/appointments",
      icon: <FaCalendarAlt />,
    },
    { name: "Payouts", path: "/admin/payout", icon: <MdAttachMoney /> },
    {
      name: "Revenue",
      path: "/admin/transactions",
      icon: <FaMoneyBillTransfer />,
    },
  ];

  interface IMenuItem {
    name: string;
    path: string;
    icon: React.ReactNode;
  }
  const renderMenuItems = (items: IMenuItem[]) => {
    return items.map((item: IMenuItem, index: number) => {
      const isActive = location.pathname === item.path;
      return (
        <Link
          to={item.path}
          key={index}
          className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-sm sm:text-base font-medium ${
            isActive
              ? "bg-gradient-to-r from-green-600 to-green-400 text-white shadow-md"
              : "text-gray-600 hover:bg-green-50 hover:text-green-700"
          } focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-1`}
          onClick={handleMobileLinkClick}
        >
          <span
            className={`text-lg sm:text-xl ${
              isActive ? "text-white" : "text-green-600"
            }`}
          >
            {item.icon}
          </span>
          {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
          {collapsed && isActive && (
            <div className="absolute left-0 w-1 h-8 bg-green-400 rounded-r-full"></div>
          )}
        </Link>
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-white shadow-xl transition-all duration-300
          ${
            mobileOpen
              ? "translate-x-0 w-30"
              : "-translate-x-full sm:translate-x-0"
          }
          ${collapsed ? "sm:w-16" : "sm:w-64"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <img
              src={mobileOpen || collapsed ? appIconSm : applogoBlue}
              alt="MyHealth Logo"
              className="h-8 w-auto object-contain sm:h-10"
            />
            {!collapsed && (
              <h1 className="ml-3 text-lg font-semibold text-gray-800 sm:text-xl">
                Admin
              </h1>
            )}
          </div>
          <button
            className="sm:hidden p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="h-[calc(100%-80px)] overflow-y-auto py-4 px-3">
          <div className="space-y-2">
            {renderMenuItems(menuItems)}
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => {
                  handleMobileLinkClick();
                  setShowConfirm(true);
                }}
                className="w-full flex items-center px-4 py-3 rounded-xl text-sm sm:text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1"
              >
                <span className="text-lg sm:text-xl text-red-600">
                  <FaSignOutAlt />
                </span>
                {!collapsed && <span className="ml-3 truncate">Logout</span>}
              </button>
            </div>
          </div>
        </nav>

        {/* Collapse Button (Desktop) */}
        <button
          onClick={toggleSidebar}
          className="absolute bottom-4 -right-3 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white text-green-600 border border-green-200 hover:bg-green-50 hover:text-green-700 transition-colors shadow-md"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <FaChevronRight size={12} />
          ) : (
            <FaChevronLeft size={12} />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
          collapsed ? "sm:ml-16" : "sm:ml-64"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm shadow-lg sm:h-20">
          <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
            {/* Profile Section (Left Corner for All Screens) */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Mobile Menu Button */}
              <button
                className="sm:hidden p-3 rounded-lg text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                onClick={toggleSidebar}
                aria-label="Toggle menu"
              >
                <FaBars className="w-6 h-6" />
              </button>
              <div className="relative" ref={profileRef}>
                <button
                  className="flex items-center focus:outline-none cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  aria-label="Profile"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-green-500 shadow-sm">
                    <img
                      src={defaultAvatar}
                      alt="Admin profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>
                {showProfileDropdown && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                    <Link
                      to="/admin/settings"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
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
                      className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Empty div to maintain layout balance */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              {/* Placeholder for potential future content */}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto">{children}</div>
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
