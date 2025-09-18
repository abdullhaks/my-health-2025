import Input from "../../sharedComponents/Input";
import adminLogin from "../../assets/adminLogin.png";
import applogoWhite from "../../assets/applogoWhite.png";
import Button from "../../sharedComponents/Button";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useEffect, useState } from "react";
import { verifyRecoveryPassword } from "../../api/admin/adminApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ApiError } from "../../interfaces/error";

// Define the validation schema
const adminRecPassSchema = z.object({
  recPass: z
    .string()
    .min(10, "Recovery code must be 10 characters")
    .max(10, "Recovery code must be 10 characters")
    .refine((val) => val.trim() === val, {
      message: "No leading or trailing spaces allowed",
    }),
});

// Define interfaces for form data and errors
interface FormData {
  recPass: string;
}

interface FormErrors {
  recPass: string;
}

function AdminRecoveryPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    recPass: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    recPass: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const [touched, setTouched] = useState({
    recPass: false,
  });

  const email = localStorage.getItem("adminEmail") || "";

  useEffect(() => {
    const result = adminRecPassSchema.safeParse(formData);
    if (!result.success) {
      const errors: FormErrors = { recPass: "" };
      result.error.errors.forEach((err) => {
        errors[err.path[0] as keyof FormErrors] = err.message;
      });
      setErrors(errors);
      setIsFormValid(false);
    } else {
      setErrors({ recPass: "" });
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
    const result = adminRecPassSchema.safeParse(formData);

    if (!result.success) {
      const errors: FormErrors = { recPass: "" };
      result.error.errors.forEach((err) => {
        errors[err.path[0] as keyof FormErrors] = err.message;
      });
      setErrors(errors);
      return;
    }

    try {
      const response = await verifyRecoveryPassword({
        email,
        password: formData.recPass,
      });

      if (response?.msg === "Recovery code verified successfully") {
        toast.success("Recovery code verified!");
        navigate("/admin/resetPassword");
      } else {
        toast.error("Invalid recovery code");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error(
        (error as ApiError).response?.data?.msg ||
          "Something went wrong. Please try again later."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-200 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-70">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="recoveryPasswordGrid"
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
          <rect width="100%" height="100%" fill="url(#recoveryPasswordGrid)" />
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
                  src={adminLogin}
                  alt="Recovery Code Illustration"
                  className="w-full h-auto object-contain drop-shadow-lg"
                />
                <div className="text-center mt-6">
                  <h3 className="text-xl xl:text-2xl font-bold text-gray-700 mb-2">
                    Verify Recovery Code
                  </h3>
                  <p className="text-sm xl:text-base text-gray-600 leading-relaxed">
                    Enter the recovery code sent to your email
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Recovery Code Form */}
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
                    Verify Recovery Code
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Enter the 10-digit recovery code sent to{" "}
                    <span className="font-semibold truncate">{email}</span>
                  </p>
                </div>

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 sm:space-y-6"
                >
                  <div className="space-y-4 sm:space-y-5">
                    <Input
                      id="recPass"
                      name="recPass"
                      label="Recovery Code"
                      type="text"
                      placeholder="Enter your 10-digit recovery code"
                      value={formData.recPass}
                      onChange={handleChange}
                      required
                      className={`transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
                        touched.recPass && errors.recPass
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      error={touched.recPass ? errors.recPass : ""}
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

                {/* Back to Login Link */}
                <div className="text-center mt-6 sm:mt-8 pt-4 border-t border-gray-100">
                  <p className="text-sm sm:text-base text-gray-600">
                    Back to{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/admin/login")}
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

export default AdminRecoveryPassword;
