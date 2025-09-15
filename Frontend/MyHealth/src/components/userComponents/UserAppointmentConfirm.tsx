import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDoctor, createOneTimePayment, walletPayment } from "../../api/user/userApi";
import { loadStripe } from "@stripe/stripe-js";
import { useSelector } from "react-redux";
import { IUserData } from "../../interfaces/user";

interface AppointmentSlot {
  id: string;
  start: Date;
  end: Date;
  duration: number;
  fee: number;
  status: "available" | "booked";
  sessionId: string;
}

interface Doctor {
  _id: string;
  fullName: string;
  specialization: string;
  experience: number;
  profile?: string;
  category?: string;
}

interface AppointmentConfirmationProps {
  doctorId: string;
  slot: AppointmentSlot;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const UserAppointmentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctorId, slot } = location.state as AppointmentConfirmationProps;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const user = useSelector((state: IUserData) => state.user.user);

  useEffect(() => {
    if (!doctorId || !slot) {
      setErrorMessage("Missing doctor or slot information.");
      return;
    }

    const fetchDoctorDetails = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await getDoctor(doctorId);
        setDoctor(response);
      } catch (error) {
        console.error("Error fetching doctor details:", error);
        setErrorMessage("Failed to load doctor details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctorDetails();
  }, [doctorId]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handlePayment = async () => {
    try {
      setPaymentStatus("processing");
      setErrorMessage("");

      const amountInPaise = slot.fee * 100;
      const metadata = {
        doctorId,
        userId: user._id,
        slotId: slot.id,
        sessionId: slot.sessionId,
        start: slot.start,
        end: slot.end,
        duration: slot.duration,
        fee: slot.fee,
        role: "user",
        type: "appointment",
      };

      const data = await createOneTimePayment(amountInPaise, metadata);
      const stripe = await stripePromise;

      if (stripe) {
        window.location.href = data.url;
      } else {
        throw new Error("Stripe initialization failed.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("error");
      setErrorMessage("Payment failed. Please try again.");
    }
  };

  const handleWalletPayment = async () => {
    try {
      setPaymentStatus("processing");
      setErrorMessage("");

      var tempDate = new Date(slot.start).toISOString().split("T")[0];
      const data = {
        doctorId,
        userId: user._id,
        userName: user.fullName,
        userEmail: user.email,
        date: tempDate,
        slotId: slot.id,
        sessionId: slot.sessionId,
        start: slot.start,
        end: slot.end,
        paymentType: "wallet",
        duration: slot.duration,
        fee: slot.fee,
        paymentStatus: "completed",
        appointmentStatus: "booked",
      };

      const response = await walletPayment(data);

      if (response.appointment) {
        navigate("/user/payment-success");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("error");
      setErrorMessage("Wallet Payment failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-3xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 transition-all duration-300">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Confirm Appointment</h2>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm sm:text-base">
            {errorMessage}
          </div>
        )}
        {paymentStatus === "success" && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-sm sm:text-base">
            Payment successful! Appointment confirmed.
          </div>
        )}
        {paymentStatus === "error" && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm sm:text-base">
            {errorMessage || "Error processing payment. Please try again."}
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-gray-500 py-4 text-sm sm:text-base">Loading...</div>
        ) : !doctor ? (
          <div className="text-center text-gray-500 py-4 text-sm sm:text-base">No doctor details available.</div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Doctor Details */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 border-b border-gray-200 pb-4 sm:pb-6">
              <img
                src={doctor.profile || "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"}
                alt={doctor.fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-sm"
              />
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">Dr. {doctor.fullName}</h3>
                <p className="text-sm sm:text-base text-gray-600">{doctor.specialization}</p>
                <span className="inline-block mt-2 text-xs sm:text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                  {doctor.category || "General"}
                </span>
                <p className="text-sm sm:text-base text-gray-500 mt-1">Experience: {doctor.experience} years</p>
              </div>
            </div>

            {/* Slot Details */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">Selected Slot</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base text-gray-600">
                <p>
                  <span className="font-medium">Date:</span> {formatDate(slot.start)}
                </p>
                <p>
                  <span className="font-medium">Time:</span> {formatTime(slot.start)} - {formatTime(slot.end)}
                </p>
                <p>
                  <span className="font-medium">Duration:</span> {slot.duration} minutes
                </p>
                <p>
                  <span className="font-medium">Fee:</span> ₹{slot.fee}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 active:scale-95"
              >
                Back to Slots
              </button>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleWalletPayment}
                  disabled={paymentStatus === "processing" || user.walletBalance < slot.fee}
                  className={`w-full sm:w-auto px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 active:scale-95 ${
                    user.walletBalance < slot.fee
                      ? "bg-gray-300 cursor-not-allowed"
                      : paymentStatus === "processing"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-yellow-500 hover:bg-yellow-600"
                  }`}
                >
                  {paymentStatus === "processing" ? "Processing..." : "Pay with Wallet"}
                </button>
                <button
                  onClick={handlePayment}
                  disabled={paymentStatus === "processing"}
                  className={`w-full sm:w-auto px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95 ${
                    paymentStatus === "processing"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  }`}
                >
                  {paymentStatus === "processing" ? "Processing..." : "Pay with Stripe"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAppointmentConfirmation;