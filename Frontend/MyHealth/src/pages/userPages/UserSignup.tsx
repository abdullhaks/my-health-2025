import { useEffect, useState } from "react";
import Input from "../../sharedComponents/Input";
import userLogin from "../../assets/userLogin.png";
import applogoWhite from "../../assets/applogoWhite.png";
import Button from "../../sharedComponents/Button";
import { FcGoogle } from "react-icons/fc";
import PasswordInput from "../../sharedComponents/PasswordInput";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { signupUser } from "../../api/user/userApi";

// Schema - signup validation
const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    fullName: z
      .string()
      .min(3, "Full name must be at least 3 characters")
      .refine((val) => val.trim() === val, {
        message: "No leading or trailing spaces allowed",
      }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one digit")
      .regex(/[@$!%*?&#]/, "Include at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupData = z.infer<typeof signupSchema>;

function UserSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupData>({
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupData, string>>
  >({});
  const [touched, setTouched] = useState<Record<keyof SignupData, boolean>>({
    email: false,
    fullName: false,
    password: false,
    confirmPassword: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value.startsWith(" ") ? value.trimStart() : value,
    }));

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  useEffect(() => {
    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignupData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof SignupData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
    }
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignupData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof SignupData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setTouched({
        email: true,
        fullName: true,
        password: true,
        confirmPassword: true,
      });
      return;
    }

    try {
      await signupUser(formData)
        .then((response) => {
          console.log("Signup successful", response);
          localStorage.setItem("userEmail", response.email);
          navigate("/user/otp");
        })
        .catch((error) => {
          console.error("Signup error", error);
          setErrors({ email: "Email already exists" });
        });
    } catch (error) {
      console.error("Error signing up", error);
      setErrors({ email: "Email already exists" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-200 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-70">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="signupGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="0.5"
                opacity="0.8"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#signupGrid)" />
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
            <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 bg-blue-300 backdrop-blur-sm rounded-lg shadow-md overflow-hidden border border-white/20">
              <img
                src={applogoWhite}
                alt="MyHealth Logo"
                className="w-full h-full object-contain p-1"
              />
            </div>
            <span className="text-base sm:text-lg md:text-xl font-bold text-blue-300 drop-shadow-md">
              MyHealth
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <div className="w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 overflow-hidden min-h-[500px] sm:min-h-[600px]">
            {/* Left Side - Illustration (Hidden on mobile) */}
            <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white p-6 lg:p-8 xl:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              <div className="relative z-10 max-w-md w-full">
                <img
                  src={userLogin}
                  alt="Signup Illustration"
                  className="w-full h-auto object-contain drop-shadow-lg"
                />
                <div className="text-center mt-4 sm:mt-6">
                  <h3 className="text-lg sm:text-xl xl:text-2xl font-bold text-gray-700 mb-2">
                    Join MyHealth
                  </h3>
                  <p className="text-sm sm:text-base xl:text-base text-gray-600 leading-relaxed">
                    Create an account to connect with healthcare professionals
                    and manage your wellness journey
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12 bg-white">
              <div className="w-full max-w-md mx-auto">
                {/* Mobile Logo (shown only on mobile) */}
                <div className="lg:hidden flex justify-center mb-6 sm:mb-8">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-br from-blue-300 to-blue-600 rounded-xl shadow-lg overflow-hidden p-2">
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
                    User Signup
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Create an account to access your health dashboard
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
                      aria-invalid={touched.email && !!errors.email}
                    />

                    <Input
                      id="fullName"
                      name="fullName"
                      label="Full Name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className={`transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
                        touched.fullName && errors.fullName
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      error={touched.fullName ? errors.fullName : ""}
                      aria-invalid={touched.fullName && !!errors.fullName}
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
                      aria-invalid={touched.password && !!errors.password}
                    />

                    <PasswordInput
                      id="confirmPassword"
                      name="confirmPassword"
                      label="Confirm Password"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
                        touched.confirmPassword && errors.confirmPassword
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      error={
                        touched.confirmPassword ? errors.confirmPassword : ""
                      }
                      aria-invalid={
                        touched.confirmPassword && !!errors.confirmPassword
                      }
                    />
                  </div>

                  {/* Sign Up Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      text="Sign Up"
                      className="w-full min-h-[48px] sm:min-h-[52px] text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 transform bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    />
                  </div>

                  {/* Divider */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white text-gray-500 font-medium">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* Google Signup Button */}
                  <div>
                    <Button
                      type="button"
                      text="Sign up with Google"
                      icon={<FcGoogle className="text-lg sm:text-xl" />}
                      className="w-full min-h-[48px] sm:min-h-[52px] bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md transition-all duration-300 text-sm sm:text-base font-semibold rounded-xl transform hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => {
                        window.location.href =
                          "https://api.abdullhakalamban.online/api/user/google";
                      }}
                    />
                  </div>
                </form>

                {/* Login Link */}
                <div className="text-center mt-6 sm:mt-8 pt-4 border-t border-gray-100">
                  <p className="text-sm sm:text-base text-gray-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/user/login")}
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200 min-h-[44px] inline-flex items-center"
                    >
                      Login
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

export default UserSignup;
