import Input from "../../sharedComponents/Input";
import doctorLogin from "../../assets/doctorLogin.png";
import applogoWhite from "../../assets/applogoWhite.png";
import Button from "../../sharedComponents/Button";
import PasswordInput from "../../sharedComponents/PasswordInput";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useEffect, useState } from "react";
import { loginDoctor } from "../../api/doctor/doctorApi";
import { useDispatch } from "react-redux";
import { loginDoctor as login, logoutDoctor } from "../../redux/slices/doctorSlices";
import toast from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { ApiError } from "../../interfaces/error";

// Define the validation schema
const doctorLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Define interfaces for form data, errors, and API response
interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
}

function DoctorLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [reason, setReason] = useState("");

  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Validate on change
  useEffect(() => {
    const result = doctorLoginSchema.safeParse(formData);
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
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = doctorLoginSchema.safeParse(formData);

    if (!result.success) {
      const errors: FormErrors = { email: "", password: "" };
      result.error.errors.forEach((err) => {
        errors[err.path[0] as keyof FormErrors] = err.message;
      });
      setErrors(errors);
      return;
    }

    try {
      setReason("");
      const response = await loginDoctor(formData);
      console.log("Login successful:", response);

      if (!response.doctor.isVerified) {
        toast.error("Please verify your account via OTP sent to your email.");
        localStorage.setItem("doctorEmail", response.doctor.email);
        navigate("/doctor/otp");
        return;
      }

      if (response.doctor.isBlocked) {
        toast.error("Your account has been blocked. Please contact support.");
        return;
      }

      if (response.doctor.adminVerified === 0) {
        toast.error("Your signup credentials are waiting for verification. Please be patient.");
        return;
      }

      if (response.doctor.adminVerified === 3) {
        setReason(response.message || "Verification failed.");
        toast.error(response.message || "Verification failed.");
        return;
      }

      dispatch(logoutDoctor());
      dispatch(
        login({
          doctor: response.doctor,
        })
      );

      toast.success("Logged in successfully");
      navigate("/doctor/dashboard");
    } catch (error) {
      console.error("Login failed:", error);

      if ((error as ApiError).response && (error as ApiError).response?.data?.status === 401) {
        toast.error("Invalid email or password");
        setErrors({ ...errors, password: "Invalid email or password" });
      } else {
        toast.error((error as ApiError).response?.data?.msg || "Something went wrong. Please try again later.");
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
            <pattern id="loginGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#3B82F6" strokeWidth="0.5" opacity="0.8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loginGrid)" />
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
                  src={doctorLogin} 
                  alt="Doctor Login Illustration" 
                  className="w-full h-auto object-contain drop-shadow-lg"
                />
                <div className="text-center mt-6">
                  <h3 className="text-xl xl:text-2xl font-bold text-gray-700 mb-2">
                    Welcome Back, Doctor
                  </h3>
                  <p className="text-sm xl:text-base text-gray-600 leading-relaxed">
                    Manage your patients and appointments seamlessly
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
                    Doctor Login
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Sign in to access your doctor dashboard
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
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

                  {/* Error Message and Forgot Password */}
                  <div className="flex flex-col items-end space-y-2">
                    {reason && (
                      <p className="text-sm text-red-600 w-full text-center">{reason}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate("/doctor/forgetPassword")}
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
                </form>

                {/* Sign Up Link */}
                <div className="text-center mt-6 sm:mt-8 pt-4 border-t border-gray-100">
                  <p className="text-sm sm:text-base text-gray-600">
                    Don’t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/doctor/signup")}
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200 min-h-[44px] inline-flex items-center"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DoctorLogin;