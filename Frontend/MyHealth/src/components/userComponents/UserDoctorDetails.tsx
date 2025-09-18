import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "antd";

interface Doctor {
  _id: string;
  fullName: string;
  category: string;
  experience: number;
  location: { text: string };
  graduation: string;
  registerNo: string;
  gender: string;
  phone: string;
  email: string;
  profile?: string;
  premiumMembership: boolean;
  offlineAvailability?: {
    offlineLocation: string;
    googleMapLink: string;
    bookingNumber: string;
  };
}

const UserDoctorDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const doctor: Doctor = location.state?.doctor;

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center text-red-500 text-base sm:text-lg bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
          No doctor data available. Please select a doctor.
        </div>
      </div>
    );
  }

  const handleBookAppointment = () => {
    navigate("/user/doctor-appointment-slots", {
      state: { doctorId: doctor._id },
    });
  };

  const handleChatClick = () => {
    navigate("/chat", { state: { doctorId: doctor._id } });
  };

  const handleReportAnalysis = () => {
    navigate("/user/health-report-analysis", { state: { doctor } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            Doctor Details
          </h2>
          <Button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 border-none text-sm sm:text-base font-medium"
          >
            ✕ Close
          </Button>
        </div>

        {/* Doctor Profile */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <img
            src={
              doctor.profile ||
              "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"
            }
            alt={doctor.fullName}
            className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full object-cover flex-shrink-0"
          />
          <div className="text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 truncate">
              Dr. {doctor.fullName}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {doctor.category} Specialist
            </p>
            {doctor.premiumMembership && (
              <span className="inline-block mt-2 px-3 py-1 text-xs sm:text-sm rounded-full bg-yellow-100 text-yellow-700 font-medium">
                Premium Member
              </span>
            )}
          </div>
        </div>

        {/* Doctor Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          <div className="space-y-4">
            <h4 className="text-lg sm:text-xl font-semibold text-gray-700">
              Personal Information
            </h4>
            <div className="space-y-3 text-sm sm:text-base text-gray-600">
              <p>
                <span className="font-medium text-gray-800">Experience:</span>{" "}
                {doctor.experience} years
              </p>
              <p>
                <span className="font-medium text-gray-800">Location:</span>{" "}
                {doctor.location.text}
              </p>
              <p>
                <span className="font-medium text-gray-800">
                  Qualification:
                </span>{" "}
                {doctor.graduation.toUpperCase()}
              </p>
              <p>
                <span className="font-medium text-gray-800">
                  Registration No:
                </span>{" "}
                {doctor.registerNo}
              </p>
              <p>
                <span className="font-medium text-gray-800">Gender:</span>{" "}
                {doctor.gender}
              </p>
              <p>
                <span className="font-medium text-gray-800">Contact:</span>{" "}
                {doctor.phone}
              </p>
              <p>
                <span className="font-medium text-gray-800">Email:</span>{" "}
                {doctor.email}
              </p>
            </div>
          </div>
          {doctor.offlineAvailability && (
            <div className="space-y-4">
              <h4 className="text-lg sm:text-xl font-semibold text-gray-700">
                Offline Availability
              </h4>
              <div className="space-y-3 text-sm sm:text-base text-gray-600">
                <p>
                  <span className="font-medium text-gray-800">Location:</span>{" "}
                  {doctor.offlineAvailability.offlineLocation}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Google Map:</span>{" "}
                  <a
                    href={doctor.offlineAvailability.googleMapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    View on Google Maps
                  </a>
                </p>
                <p>
                  <span className="font-medium text-gray-800">
                    Booking Number:
                  </span>{" "}
                  {doctor.offlineAvailability.bookingNumber}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {doctor.premiumMembership && (
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleBookAppointment}
              className="w-full sm:w-auto px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl sm:rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px]"
            >
              Book Appointment
            </button>
            <button
              onClick={handleChatClick}
              className="w-full sm:w-auto px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl sm:rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px]"
            >
              Chat
            </button>
            <button
              onClick={handleReportAnalysis}
              className="w-full sm:w-auto px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-medium rounded-xl sm:rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px]"
            >
              Report Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDoctorDetails;
