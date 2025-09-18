import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userLogin from "../../assets/userLogin.png";
import applogoWhite from "../../assets/applogoWhite.png";
import Button from "../../sharedComponents/Button";
import { verifyOtp } from "../../api/user/userApi";
import { resentOtp } from "../../api/user/userApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UserOtpVerification() {
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail") || "";
  const [resendDisabled, setResendDisabled] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(60);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Start timer immediately when component mounts
    setResendDisabled(true);
    setTimer(60);

    const interval: NodeJS.Timeout = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setResendDisabled(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleResendOTP = async () => {
    try {
      setResendDisabled(true);
      setTimer(60);
      await resentOtp(email);
      toast.success("OTP resent to your email.");
      setOtp(["", "", "", "", "", ""]);
      const interval: NodeJS.Timeout = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setResendDisabled(false);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (otp[index] !== "") {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();

        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setError("Please enter a 6-digit OTP.");
      return;
    }

    try {
      const otpData = { email, otp: enteredOtp };
      const response = await verifyOtp(otpData);
      console.log("OTP verified successfully:", response.data);
      toast.success("OTP verified successfully. Please log in.");

      setTimeout(() => {
        navigate("/user/login");
      }, 2000);
    } catch (err: unknown) {
      setError("Invalid OTP or verification failed.");
      console.error("Error verifying OTP:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-200 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-70">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="otpGrid"
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
          <rect width="100%" height="100%" fill="url(#otpGrid)" />
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
                  alt="OTP Verification Illustration"
                  className="w-full h-auto object-contain drop-shadow-lg"
                />
                <div className="text-center mt-4 sm:mt-6">
                  <h3 className="text-lg sm:text-xl xl:text-2xl font-bold text-gray-700 mb-2">
                    Verify Your Email
                  </h3>
                  <p className="text-sm sm:text-base xl:text-base text-gray-600 leading-relaxed line-clamp-3">
                    Enter the 6-digit OTP sent to your email to complete
                    verification
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
                    Verify Your Email
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Enter the 6-digit OTP sent to{" "}
                    <span className="font-semibold">{email}</span>
                  </p>
                </div>

                {/* Form */}
                <div className="space-y-5 sm:space-y-6">
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-base sm:text-lg border-2 ${
                          error && digit === ""
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        } rounded-lg focus:outline-none focus:ring-2 transition-all duration-200`}
                        aria-label={`OTP digit ${index + 1}`}
                        aria-invalid={error && digit === "" ? "true" : "false"}
                      />
                    ))}
                  </div>

                  {error && (
                    <p className="text-sm sm:text-base text-red-600 text-center line-clamp-2">
                      {error}
                    </p>
                  )}

                  <div className="pt-2">
                    <Button
                      type="button"
                      text="Verify OTP"
                      onClick={handleVerify}
                      className="w-full min-h-[48px] sm:min-h-[52px] text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 transform bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    />
                  </div>

                  <div className="text-center">
                    <p className="text-sm sm:text-base text-gray-600 mb-2">
                      Didn't receive the code?{" "}
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resendDisabled}
                        className={`min-h-[44px] inline-flex items-center text-sm sm:text-base font-semibold transition-colors duration-200 ${
                          resendDisabled
                            ? "text-gray-500 cursor-not-allowed"
                            : "text-blue-600 hover:text-blue-700 hover:underline"
                        }`}
                      >
                        {resendDisabled
                          ? `Resend OTP in ${timer}s`
                          : "Resend OTP"}
                      </button>
                    </p>
                    <p className="text-sm sm:text-base text-gray-600">
                      Back to{" "}
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
        </div>
      </main>
    </div>
  );
}

export default UserOtpVerification;
