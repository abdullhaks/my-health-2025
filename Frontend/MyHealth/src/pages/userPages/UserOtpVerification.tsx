import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userLogin from "../../assets/userLogin.png";
import applogoWhite from "../../assets/applogoWhite.png";
import Button from "../../sharedComponents/Button";
import { verifyOtp } from "../../api/user/userApi";
import { resentOtp } from "../../api/user/userApi";
import { toast } from "react-toastify";
import { message } from "antd";

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
      setOtp (["", "", "", "", "", ""]);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
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
      message.success("OTP verified successfully. Please log in.");

      setTimeout(() => {
        navigate("/user/login");
      }, 2000);
    } catch (err: unknown) {
      setError("Invalid OTP or verification failed.");
      console.error("Error verifying OTP:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen mesh-bg">
      <div className="container mx-auto pt-5 flex justify-start items-center">
        <img src={applogoWhite} alt="MyHealth Logo" className="h-20 object-contain" />
      </div>

      <div className="flex flex-1 justify-center items-center">
        <div className="flex items-center justify-center bg-transparent">
          <div className="flex flex-col md:flex-row bg-blue-200 shadow-lg overflow-hidden max-w-4xl w-full rounded-xl">
            <div className="md:w-1/2 hidden md:flex justify-center items-center p-4 bg-blue-200">
              <img src={userLogin} alt="OTP Illustration" className="w-full h-full object-cover" />
            </div>

            <div className="w-full md:w-1/2 p-8 bg-white rounded-lg">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Verify Your Email</h2>
              <p className="text-center text-gray-600 mb-6">
                Enter the 6-digit OTP sent to <span className="font-semibold">{email}</span>
              </p>

              <div className="flex justify-center gap-2 mb-4">
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
                    className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>

              {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

              <Button
                text="Verify OTP"
                onClick={handleVerify}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
              />

              <p className="text-sm text-center mt-4 text-gray-600">
                Didn't receive the code?{" "}
                <Button
                  text={resendDisabled ? `Resend OTP in ${timer}s` : "Resend OTP"}
                  onClick={handleResendOTP}
                  disabled={resendDisabled}
                  className={`${
                    resendDisabled ? "bg-gray-400 cursor-not-allowed text-blue-700" : "bg-blue-700 text-white cursor-pointer"
                  } `}
                />
              </p>

              <p className="text-sm text-center mt-2 text-gray-600">
                Back to{" "}
                <span
                  onClick={() => navigate("/user/login")}
                  className="text_WS_0 = WS_0 && WS_0 <= 3 ? 'text-blue-600' : 'text-blue-600  cursor-pointer'
                  : WS_0 >= 4 ? 'text-blue-600 hover:underline cursor-pointer' : 'text-blue-600  cursor-pointer'"
                >
                  Login
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserOtpVerification;