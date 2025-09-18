import Input from "../../sharedComponents/Input";
import adminLoginImg from "../../assets/adminLogin.png";
import applogoWhite from "../../assets/applogoWhite.png";
import Button from "../../sharedComponents/Button";
// import { FcGoogle } from "react-icons/fc";
import PasswordInput from "../../sharedComponents/PasswordInput";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useEffect, useState } from "react";
import { loginAdmin } from "../../api/admin/adminApi";
import { useDispatch } from "react-redux";
import {
  loginAdmin as login,
  logoutAdmin,
} from "../../redux/slices/adminSlices";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ApiError } from "../../interfaces/error";

// Define the validation schema
const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Define interfaces for form data and errors
interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
}

function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const result = adminLoginSchema.safeParse(formData);
    if (!result.success) {
      const errors: FormErrors = { email: "", password: "" };
      result.error.errors.forEach((err) => {
        errors[err.path[0] as keyof FormErrors] = err.message;
      });
      setErrors(errors);
      setIsFormValid(false);
    } else {
      setErrors({ email: "", password: "" });
      setIsFormValid(true);
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = adminLoginSchema.safeParse(formData);
    if (!result.success) {
      const errors: FormErrors = { email: "", password: "" };
      result.error.errors.forEach((err) => {
        errors[err.path[0] as keyof FormErrors] = err.message;
      });
      setErrors(errors);
      return;
    }

    try {
      console.log("Form data before login:", formData);
      const response = await loginAdmin(formData);
      console.log("Admin login success:", response);

      dispatch(logoutAdmin());
      dispatch(
        login({
          admin: response.admin,
        })
      );

      toast.success("Logged in as Admin");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(
        (error as ApiError).response?.data?.msg || "Invalid credentials!"
      );

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as ApiError).response &&
        (error as ApiError).response?.data?.status === 401
      ) {
        setErrors({ ...errors, password: "Invalid email or password" });
      } else {
        setErrors({ ...errors, email: " " });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-200 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-70">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="adminLoginGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="0.5"
                opacity="0.8"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#adminLoginGrid)" />
        </svg>
      </div>

      {/* Floating background elements */}
      <div className="absolute top-10 left-5 w-16 h-16 sm:w-20 sm:h-20 bg-blue-300/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-20 right-10 w-24 h-24 sm:w-32 sm:h-32 bg-purple-300/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-10 left-1/4 w-20 h-20 sm:w-24 sm:h-24 bg-blue-400/20 rounded-full blur-xl animate-pulse delay-2000"></div>

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="container mx-auto flex justify-start items-center">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 bg-blue-300 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/20">
              <img
                src={applogoWhite}
                alt="MyHealth Logo"
                className="w-full h-full object-contain p-1"
              />
            </div>
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-300 drop-shadow-md">
              MyHealth
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <div className="w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 overflow-hidden min-h-[600px] sm:min-h-[700px]">
            {/* Left Side - Illustration (Hidden on mobile) */}
            <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white p-8 xl:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              <div className="relative z-10 max-w-md w-full">
                <img
                  src={adminLoginImg}
                  alt="Admin Login Illustration"
                  className="w-full h-auto object-contain drop-shadow-lg"
                />
                <div className="text-center mt-6">
                  <h3 className="text-xl xl:text-2xl font-bold text-gray-700 mb-2">
                    Admin Access
                  </h3>
                  <p className="text-sm xl:text-base text-gray-600 leading-relaxed">
                    Sign in to manage the platform and oversee operations
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12 bg-white">
              <div className="w-full max-w-md mx-auto">
                {/* Mobile Logo (shown only on mobile) */}
                <div className="lg:hidden flex justify-center mb-6 sm:mb-8">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-blue-300 to-blue-600 rounded-2xl shadow-lg overflow-hidden p-2">
                    <img
                      src={applogoWhite}
                      alt="MyHealth Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
                    Admin Login
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Sign in to access the admin dashboard
                  </p>
                </div>

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 sm:space-y-6"
                >
                  <div className="space-y-4 sm:space-y-5">
                    <Input
                      id="email"
                      name="email"
                      label="Email Address"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
                        touched.email && errors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      error={touched.email ? errors.email : ""}
                    />

                    <PasswordInput
                      id="password"
                      name="password"
                      label="Password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
                        touched.password && errors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      error={touched.password ? errors.password : ""}
                    />
                  </div>

                  {/* Forgot Password */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => navigate("/admin/forgetPassword")}
                      className="text-sm sm:text-base text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors duration-200 min-h-[44px] flex items-center justify-end w-full sm:w-auto"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Login Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      text="Sign In"
                      disabled={!isFormValid}
                      className={`w-full min-h-[48px] sm:min-h-[52px] text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 transform ${
                        isFormValid
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    />
                  </div>

                  {/* Divider */}
                  {/* <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white text-gray-500 font-medium">
                        Or continue with
                      </span>
                    </div>
                  </div> */}

                  {/* Google Login Button */}
                  {/* <div>
                    <Button
                      type="button"
                      text="Sign in with Google"
                      icon={<FcGoogle className="text-lg sm:text-xl" />}
                      className="w-full min-h-[48px] sm:min-h-[52px] bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md transition-all duration-300 text-sm sm:text-base font-semibold rounded-xl transform hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => {
                        window.location.href = "https://api.abdullhakalamban.online/api/admin/google";
                      }}
                    />
                  </div> */}
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminLogin;
