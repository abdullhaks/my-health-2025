import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import PasswordInput from "../../sharedComponents/PasswordInput";
import Button from "../../sharedComponents/Button";
import { resetPassword } from "../../api/user/userApi";
import { toast } from "react-toastify";
import applogoWhite from "../../assets/applogoWhite.png";
import userLogin from "../../assets/userLogin.png";
import "react-toastify/dist/ReactToastify.css";

// Validation schema
const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one digit")
      .regex(/[@$!%*?&#]/, "Password must include at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// Type for the expected API response
interface ResetPasswordResponse {
  success: boolean;
  [key: string]: unknown; // Allow additional properties
}

function UserResetPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ResetPasswordData>({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ResetPasswordData, string>>>({
    newPassword: "",
    confirmPassword: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [touched, setTouched] = useState<Record<keyof ResetPasswordData, boolean>>({
    newPassword: false,
    confirmPassword: false,
  });

  const email = localStorage.getItem("userEmail") || "";

  // Validate on change
  useEffect(() => {
    const result = resetPasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ResetPasswordData, string>> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as keyof ResetPasswordData] = err.message;
      });
      setErrors(fieldErrors);
      setIsFormValid(false);
    } else {
      setErrors({ newPassword: "", confirmPassword: "" });
      setIsFormValid(true);
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    setTouched((prev) => ({
      ...prev,
      [name as keyof ResetPasswordData]: true,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = resetPasswordSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ResetPasswordData, string>> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as keyof ResetPasswordData] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!email) {
      toast.error("No email found. Please start the recovery process again.");
      navigate("/user/forgetPassword");
      return;
    }

    try {
      const response: ResetPasswordResponse = await resetPassword(email, formData);
      console.log("submit successful:", response);

      if (!response.success) {
        toast.warning("Resetting password has failed.");
        setErrors({ newPassword: "Failed to reset password" });
        return;
      }

      toast.success("Password reset successfully");
      navigate("/user/login");
    } catch (error: unknown) {
      console.error("Reset password failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong. Please try again later.";
      toast.error(errorMessage);
      setErrors({ newPassword: "Failed to reset password" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-200 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-70">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="resetPasswordGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B82F6" strokeWidth="0.5" opacity="0.8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#resetPasswordGrid)" />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 overflow-hidden min-h-[400px] sm:min-h-[500px]">
            
            {/* Left Side - Illustration (Hidden on mobile) */}
            <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white p-6 lg:p-8 xl:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              <div className="relative z-10 max-w-md w-full">
                <img 
                  src={userLogin} 
                  alt="Reset Password Illustration" 
                  className="w-full h-auto object-contain drop-shadow-lg"
                />
                <div className="text-center mt-4 sm:mt-6">
                  <h3 className="text-lg sm:text-xl xl:text-2xl font-bold text-gray-700 mb-2">
                    Reset Your Password
                  </h3>
                  <p className="text-sm sm:text-base xl:text-base text-gray-600 leading-relaxed line-clamp-3">
                    Create a new password to regain access to your health dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
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
                    Reset Password
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Enter a new password for <span className="font-semibold">{email}</span>
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  <div className="space-y-4 sm:space-y-5">
                    <PasswordInput
                      id="newPassword"
                      name="newPassword"
                      label="New Password"
                      placeholder="Enter your new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
                        touched.newPassword && errors.newPassword 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                          : "focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      error={touched.newPassword ? errors.newPassword : ""}
                      aria-invalid={touched.newPassword && !!errors.newPassword}
                    />
                    <PasswordInput
                      id="confirmPassword"
                      name="confirmPassword"
                      label="Confirm Password"
                      placeholder="Re-enter your new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
                        touched.confirmPassword && errors.confirmPassword 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                          : "focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      error={touched.confirmPassword ? errors.confirmPassword : ""}
                      aria-invalid={touched.confirmPassword && !!errors.confirmPassword}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      text="Submit"
                      disabled={!isFormValid}
                      className={`w-full min-h-[48px] sm:min-h-[52px] text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 transform ${
                        isFormValid 
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]" 
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    />
                  </div>
                </form>

                {/* Signup Link */}
                <div className="text-center mt-6 sm:mt-8 pt-4 border-t border-gray-100">
                  <p className="text-sm sm:text-base text-gray-600">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/user/signup")}
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200 min-h-[44px] inline-flex items-center"
                    >
                      Signup
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

export default UserResetPassword;