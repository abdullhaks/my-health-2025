import { useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  Variants,
} from "framer-motion";
import appLogo from "../../assets/applogoblue.png";
import {
  Heart,
  Shield,
  Users,
  Video,
  FileText,
  Newspaper,
  BookOpen,
  MessageCircle,
  CreditCard,
  Activity,
  Stethoscope,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  Star,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  ShoppingCart,
  Globe,
  Award,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { scrollY } = useScroll();
  const navigate = useNavigate();

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 1800], [1, 0]);

  // Animation variants
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const slideInRight: Variants = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const dropdownItemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  };

  const handleNavigation = (role: "doctor" | "user") => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    navigate(role === "doctor" ? "/doctor/login" : "/user/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-blue-100 shadow-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-2 sm:space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={appLogo}
                alt="MyHealth Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-800">
              MyHealth
            </span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {["Services", "Features", "Our Mission", "Contact"].map(
              (item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm lg:text-base text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  {item}
                </motion.a>
              )
            )}
            <div className="relative">
              <motion.button
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md text-sm sm:text-base font-medium"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                Get Started
              </motion.button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    className="absolute top-full right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-blue-100 z-50"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <motion.button
                      className="w-full text-left px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      variants={dropdownItemVariants}
                      onClick={() => handleNavigation("doctor")}
                    >
                      As Doctor
                    </motion.button>
                    <motion.button
                      className="w-full text-left px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      variants={dropdownItemVariants}
                      onClick={() => handleNavigation("user")}
                    >
                      As User
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <motion.button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6 text-blue-600" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6 text-blue-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden bg-white border-t border-blue-100 shadow-md"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="px-4 py-6 space-y-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {["Services", "Features", "Our Mission", "Contact"].map(
                  (item, index) => (
                    <motion.a
                      key={index}
                      href={`#${item.toLowerCase().replace(" ", "-")}`}
                      className="block py-2 text-sm text-gray-700 hover:text-blue-600 font-medium"
                      variants={fadeInUp}
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item}
                    </motion.a>
                  )
                )}
                <div className="relative">
                  <motion.button
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-full text-sm font-medium"
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    Get Started
                  </motion.button>
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        className="w-full mt-2 bg-white rounded-lg shadow-lg border border-blue-100"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <motion.button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          variants={dropdownItemVariants}
                          onClick={() => handleNavigation("doctor")}
                        >
                          As Doctor
                        </motion.button>
                        <motion.button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          variants={dropdownItemVariants}
                          onClick={() => handleNavigation("user")}
                        >
                          As User
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="heroGrid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <motion.path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </pattern>
              <radialGradient id="heroGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.05" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#heroGrid)" />
            <rect width="100%" height="100%" fill="url(#heroGradient)" />
          </svg>
        </div>

        <motion.div
          className="absolute top-10 left-5 w-16 h-16 sm:w-20 sm:h-20 bg-blue-300 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-20 right-10 w-24 h-24 sm:w-32 sm:h-32 bg-green-300 rounded-full blur-xl"
          animate={{
            y: [0, 30, 0],
            x: [0, -10, 0],
            scale: [1, 0.9, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        />
        <motion.div
          className="absolute bottom-10 left-1/4 w-20 h-20 sm:w-24 sm:h-24 bg-blue-300 rounded-full blur-xl"
          animate={{
            y: [0, -15, 0],
            x: [0, 20, 0],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 4 }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            className="max-w-4xl mx-auto"
            style={{ y: heroY, opacity: heroOpacity }}
          >
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 leading-tight"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div
                className="flex items-center justify-center mb-4 sm:mb-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-12 w-32 sm:h-18 sm:w-48 md:h-24 md:w-64 bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={appLogo}
                    alt="MyHealth Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>
              <motion.span
                className="text-gray-800 text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              >
                Your Modern Healthcare Community
              </motion.span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto">
                <span className="font-semibold text-blue-700">
                  "Connecting People, Doctors, and Health—All in One Place."
                </span>
                <br />
                Your one-stop digital health platform for consultations, health
                monitoring, medical reports, and community care.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              <motion.button
                className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md flex items-center min-h-[44px]"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
                  y: -2,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/user/signup")}
              >
                Get Started
                <motion.div
                  className="ml-2 sm:ml-3"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </motion.div>
              </motion.button>
              <motion.button
                className="group border-2 border-blue-600 text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-md flex items-center min-h-[44px]"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
                  y: -2,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/user/login")}
              >
                <Video className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                Book Appointment
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose MyHealth */}
      <section
        id="features"
        className="py-12 sm:py-16 md:py-20 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-gray-50 opacity-50">
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="whyChoosePattern"
                x="0"
                y="0"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="40" cy="40" r="1" fill="#3B82F6" opacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#whyChoosePattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-10 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
              Why Choose MyHealth?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A{" "}
              <span className="font-semibold text-blue-600">
                safe, reliable, and modern healthcare ecosystem
              </span>{" "}
              designed for individuals, doctors, and communities.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Video,
                title: "Easy Doctor Consultations & Report Analysises",
                desc: "Online appointments and health reports analysis with trusted professionals",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Activity,
                title: "AI-Powered Health Monitoring",
                desc: "Smart insights and personalized health reports",
                color: "from-green-500 to-green-600",
              },
              {
                icon: Shield,
                title: "Secure Medical Records",
                desc: "Your health data protected with enterprise-grade security",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: MessageCircle,
                title: "Real-time Communications",
                desc: "Chat & video consultations with instant support",
                color: "from-orange-500 to-orange-600",
              },
              {
                icon: Newspaper,
                title: "Latest Health News & Blogs",
                desc: "Stay updated with verified healthcare information",
                color: "from-pink-500 to-pink-600",
              },
              {
                icon: CreditCard,
                title: "Transparent Payments & Refunds",
                desc: "Safe transactions with clear receipts and transparency",
                color: "from-indigo-500 to-indigo-600",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
                className="group bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 h-full"
              >
                <motion.div
                  className={`bg-gradient-to-r ${feature.color} w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center mb-4 sm:mb-6 shadow-md`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white mr-1" />
                  <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </motion.div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                  {" "}
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-3">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Services */}
      <section
        id="services"
        className="py-12 sm:py-16 md:py-20 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-25 to-purple-50 opacity-50">
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="servicesPattern"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0,0 L100,100 M100,0 L0,100"
                  stroke="#3B82F6"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#servicesPattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-10 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
              Our Core Services
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive healthcare solutions designed to meet all your
              medical needs
            </p>
          </motion.div>

          <div className="space-y-8 sm:space-y-12 max-w-7xl mx-auto">
            {[
              {
                icon: Stethoscope,
                title: "Online & Offline Doctor Consultations",
                desc: "Book appointments with trusted doctors near you or consult instantly via secure video calls. Access to specialist doctors across various medical fields.",
                features: [
                  "Instant video consultations",
                  "Local doctor booking",
                  "Specialist access",
                  "Flexible scheduling",
                ],
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: BarChart3,
                title:
                  "AI-Powered Health Reports & Free Health Status Monitoring",
                desc: "Submit your basic health data (sugar, BP, cholesterol, etc.) and get smart insights about your health status with personalized recommendations and periodic assessments.",
                features: [
                  "Smart health analysis",
                  "Trend monitoring",
                  "Personalized insights",
                  "Risk assessment",
                ],
                color: "from-green-500 to-green-600",
              },
              {
                icon: FileText,
                title: "Expert Health Report Analysis",
                desc: "Upload lab tests or reports and get professional analysis and personalized advice from qualified medical professionals.",
                features: [
                  "Professional analysis",
                  "Detailed insights",
                  "Personalized advice",
                  "Quick turnaround",
                ],
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: Newspaper,
                title: "Health News, Blogs & Free General Health Tips",
                desc: "Stay updated with verified healthcare news and insightful blogs from medical professionals. Get valuable health tips and general awareness regularly.",
                features: [
                  "Latest health news",
                  "Expert blogs",
                  "Health tips",
                  "Medical insights",
                ],
                color: "from-orange-500 to-orange-600",
              },
              {
                icon: BookOpen,
                title: "Free Journal Publications Platform",
                desc: "A free platform for doctors & researchers to publish medical journals and share knowledge with the healthcare community.",
                features: [
                  "Free publishing",
                  "Peer review",
                  "Global reach",
                  "Knowledge sharing",
                ],
                color: "from-pink-500 to-pink-600",
              },
              {
                icon: ShoppingCart,
                title: "High-Quality Healthcare Products Store",
                desc: "A curated store offering only the best quality healthcare products, medications, and wellness items for users.",
                features: [
                  "Quality assured",
                  "Curated selection",
                  "Easy ordering",
                  "Fast delivery",
                ],
                color: "from-indigo-500 to-indigo-600",
              },
              {
                icon: Globe,
                title: "Healthcare Centers Advertisement Platform",
                desc: "A dedicated space for healthcare centers to advertise their services to a targeted audience and connect with patients.",
                features: [
                  "Targeted advertising",
                  "Center promotion",
                  "Patient connection",
                  "Service visibility",
                ],
                color: "from-teal-500 to-teal-600",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                className={`flex flex-col ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } items-center gap-6 sm:gap-8 bg-white/90 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300`}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <motion.div
                  className="flex-1 text-center lg:text-left"
                  variants={index % 2 === 0 ? slideInLeft : slideInRight}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <motion.div
                    className={`bg-gradient-to-r ${service.color} w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center mb-4 sm:mb-6 mx-auto lg:mx-0 shadow-md`}
                    whileHover={{
                      rotate: 360,
                      scale: 1.1,
                      transition: { duration: 0.6 },
                    }}
                  >
                    <service.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </motion.div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                    {service.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed line-clamp-4">
                    {service.desc}
                  </p>
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {service.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-center text-gray-700"
                        variants={fadeInUp}
                        whileHover={{ x: 5 }}
                      >
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium line-clamp-2">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>

                <motion.div
                  className="flex-1 max-w-sm"
                  variants={index % 2 === 0 ? slideInRight : slideInLeft}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <motion.div
                    className={`bg-gradient-to-br ${service.color} rounded-xl p-6 sm:p-8 shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300`}
                    whileHover={{
                      rotate: 0,
                      scale: 1.05,
                      y: -5,
                    }}
                    animate={{
                      rotate: [2, -2, 2],
                      transition: { duration: 4, repeat: Infinity },
                    }}
                  >
                    <div className="bg-white/10 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                          transition: {
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                          },
                        }}
                      >
                        <service.icon className="h-12 w-12 sm:h-14  text-white mx-auto mb-4" />
                      </motion.div>
                      <div className="text-white text-center">
                        <div className="text-xs sm:text-sm opacity-90 mb-2">
                          Available Now
                        </div>
                        <div className="text-lg sm:text-xl font-bold">
                          24/7 Service
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section
        id="our-mission"
        className="py-12 sm:py-16 md:py-20 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-gray-50 opacity-50">
          <svg
            className="absolute inset-0 w-full h-full opacity-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="missionPattern"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M50 0 L50 100 M0 50 L100 50"
                  stroke="#3B82F6"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#missionPattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-10 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
              Our Mission
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              To{" "}
              <span className="font-semibold text-blue-600">
                revolutionize healthcare
              </span>{" "}
              by making it accessible, efficient, and community-driven through
              innovative technology.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Heart,
                title: "Patient-Centric Care",
                desc: "Empowering patients with tools and knowledge to take control of their health.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Users,
                title: "Community Engagement",
                desc: "Building a supportive healthcare community for patients and professionals.",
                color: "from-green-500 to-green-600",
              },
              {
                icon: Zap,
                title: "Innovative Technology",
                desc: "Leveraging AI and secure platforms to enhance healthcare delivery.",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: Award,
                title: "Quality Assurance",
                desc: "Ensuring the highest standards in medical services and products.",
                color: "from-orange-500 to-orange-600",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <motion.div
                  className={`bg-gradient-to-r ${item.color} w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center mb-4 sm:mb-6 shadow-md`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <item.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </motion.div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-3">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-50">
          <svg
            className="absolute inset-0 w-full h-full opacity-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="testimonialsPattern"
                x="0"
                y="0"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="40" cy="40" r="1" fill="#3B82F6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#testimonialsPattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-10 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
              What Our Users Say
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our satisfied patients and healthcare professionals.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                name: "Dr. Sarah Johnson",
                role: "Cardiologist",
                quote:
                  "MyHealth has transformed how I connect with my patients. The platform's secure video consultations and report analysis tools are game-changers.",
                rating: 5,
              },
              {
                name: "Michael Chen",
                role: "Patient",
                quote:
                  "The AI-powered health reports helped me understand my condition better and take proactive steps. The support team is always there when I need them!",
                rating: 4,
              },
              {
                name: "Dr. Priya Sharma",
                role: "General Practitioner",
                quote:
                  "Publishing my research on MyHealth's journal platform has been seamless. It's a fantastic way to share knowledge with the global medical community.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="flex items-center mb-4 sm:mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-600 italic mb-4 sm:mb-6 line-clamp-4">
                  {testimonial.quote}
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-200 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
                  <div>
                    <div className="text-sm sm:text-base font-bold text-gray-800">
                      {testimonial.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-12 sm:py-16 md:py-20 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-50">
          <svg
            className="absolute inset-0 w-full h-full opacity-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="contactPattern"
                x="0"
                y="0"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="40" cy="40" r="1" fill="#3B82F6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#contactPattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-10 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
              Contact Us
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions? Reach out to our team for support or inquiries.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              variants={slideInLeft}
              className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
                Get in Touch
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2 sm:mr-3" />
                  <span className="text-sm sm:text-base">
                    123 Health Street, Wellness City, USA
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2 sm:mr-3" />
                  <span className="text-sm sm:text-base">
                    +1 (800) 123-4567
                  </span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2 sm:mr-3" />
                  <span className="text-sm sm:text-base">
                    support@myhealth.com
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={slideInRight}
              className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
                Send a Message
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                />
                <textarea
                  placeholder="Your Message"
                  rows={5}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
                ></textarea>
                <motion.button
                  type="button"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 rounded-full text-sm sm:text-base font-semibold hover:shadow-md transition-all duration-300 min-h-[44px]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send Message
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={appLogo}
                    alt="MyHealth Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-base sm:text-lg font-bold">MyHealth</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-200 line-clamp-3">
                Your modern healthcare community, connecting patients, doctors,
                and wellness.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {["Services", "Features", "Our Mission", "Contact"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href={`#${item.toLowerCase().replace(" ", "-")}`}
                        className="text-xs sm:text-sm hover:text-blue-200 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#health-news"
                    className="text-xs sm:text-sm hover:text-blue-200 transition-colors"
                  >
                    Health News
                  </a>
                </li>
                <li>
                  <a
                    href="#blogs"
                    className="text-xs sm:text-sm hover:text-blue-200 transition-colors"
                  >
                    Blogs
                  </a>
                </li>
                <li>
                  <a
                    href="#journal"
                    className="text-xs sm:text-sm hover:text-blue-200 transition-colors"
                  >
                    Journal Publications
                  </a>
                </li>
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">
                Contact Info
              </h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-xs sm:text-sm">
                    123 Health Street, Wellness City, USA
                  </span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-xs sm:text-sm">+1 (800) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-xs sm:text-sm">
                    support@myhealth.com
                  </span>
                </li>
              </ul>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-blue-500/50 text-center"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} MyHealth. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
