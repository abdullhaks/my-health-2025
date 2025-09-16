import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaLock, FaUnlock } from "react-icons/fa";
import { doctorDetails, verifyDoctor, declineDoctor } from "../../api/admin/adminApi";
import { Popconfirm, Input } from "antd";
import toast from "react-hot-toast";
import { ILocation } from "../../interfaces/doctor";

interface DoctorDetails {
  _id: string;
  fullName: string;
  email: string;
  isBlocked: boolean;
  isVerified: boolean;
  profile: string;
  adminVerified: number;
  graduation: string;
  graduationCertificate: string;
  registerNo: string;
  registrationCertificate: string;
  verificationId: string;
  walletBalance: number;
  location?: ILocation;
  specializations?: string[];
}

const AdminDoctorDetails = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");

  const handleVerify = async (id: string) => {
    try {
      await verifyDoctor(id);
      setDoctor(prev => (prev ? { ...prev, adminVerified: 1 } : prev));
      toast.success("Doctor verified successfully");
    } catch (err) {
      console.error("Verification failed:", err);
      toast.error("Failed to verify doctor");
    }
  };

  const handleDecline = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      await declineDoctor(id, rejectReason);
      setDoctor(prev => (prev ? { ...prev, adminVerified: 2 } : prev));
      toast.success("Doctor declined successfully");
      setRejectReason("");
    } catch (err) {
      console.error("Decline failed:", err);
      toast.error("Failed to decline doctor");
    }
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        if (id) {
          const res = await doctorDetails(id);
          console.log("Response from frontend:", res);
          setDoctor(res);
        }
      } catch (err) {
        console.error("Failed to load doctor:", err);
        toast.error("Failed to load doctor details");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) return <p className="text-center mt-6 text-gray-600 text-sm sm:text-base">Loading...</p>;
  if (!doctor) return <p className="text-center mt-6 text-red-600 text-sm sm:text-base">Doctor not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6">
          {/* Profile Section */}
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-gray-200">
              <img
                src={doctor.profile ? doctor.profile : "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"}
                alt="Doctor profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="w-full md:w-2/3 space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-green-700 truncate">
              Dr. {doctor.fullName}
            </h2>
            <div className="space-y-2">
              <p className="text-sm sm:text-base text-gray-700">
                <strong>Email:</strong> <span className="truncate">{doctor.email}</span>
              </p>
              <p className="text-sm sm:text-base text-gray-700">
                <strong>Graduation:</strong> {doctor.graduation}
              </p>
              <p className="text-sm sm:text-base text-gray-700">
                <strong>Register No:</strong> {doctor.registerNo}
              </p>
              <p className="text-sm sm:text-base text-gray-700">
                <strong>Admin Verification:</strong>{" "}
                {doctor.adminVerified === 0 ? (
                  <span className="text-blue-600 font-semibold">Pending</span>
                ) : doctor.adminVerified === 1 ? (
                  <span className="text-green-600 font-semibold flex items-center">
                    <FaCheckCircle className="mr-1 w-4 h-4 sm:w-5 sm:h-5" /> Verified
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold flex items-center">
                    <FaTimesCircle className="mr-1 w-4 h-4 sm:w-5 sm:h-5" /> Rejected
                  </span>
                )}
              </p>
              <p className="text-sm sm:text-base text-gray-700">
                <strong>Account Status:</strong>{" "}
                {doctor.isBlocked ? (
                  <span className="text-red-600 font-semibold flex items-center">
                    <FaLock className="mr-1 w-4 h-4 sm:w-5 sm:h-5" /> Blocked
                  </span>
                ) : (
                  <span className="text-green-600 font-semibold flex items-center">
                    <FaUnlock className="mr-1 w-4 h-4 sm:w-5 sm:h-5" /> Active
                  </span>
                )}
              </p>
            </div>

            {/* Certificates */}
            <div className="space-y-2">
              <p className="text-sm sm:text-base text-gray-700">
                <strong>Graduation Certificate:</strong>
              </p>
              <a
                href={doctor.graduationCertificate}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm sm:text-base underline transition-colors"
              >
                View Graduation Certificate
              </a>
              <p className="text-sm sm:text-base text-gray-700">
                <strong>Registration Certificate:</strong>
              </p>
              <a
                href={doctor.registrationCertificate}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm sm:text-base underline transition-colors"
              >
                View Registration Certificate
              </a>
              <p className="text-sm sm:text-base text-gray-700">
                <strong>Verification ID:</strong>
              </p>
              <a
                href={doctor.verificationId}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm sm:text-base underline transition-colors"
              >
                View Verification ID
              </a>
            </div>

            {/* Action Buttons */}
            {doctor.adminVerified === 0 ? (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Popconfirm
                  title="Decline Doctor"
                  description={
                    <div className="space-y-2">
                      <p className="text-sm">Please provide a reason for rejection:</p>
                      <Input
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter rejection reason"
                        className="w-full"
                      />
                    </div>
                  }
                  onConfirm={() => handleDecline(doctor._id)}
                  onCancel={() => setRejectReason("")}
                  okText="Submit"
                  cancelText="Cancel"
                >
                  <button
                    className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base font-medium"
                  >
                    Decline
                  </button>
                </Popconfirm>
                <Popconfirm
                  title="Verify Doctor"
                  description="Are you sure to verify this doctor?"
                  onConfirm={() => handleVerify(doctor._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <button
                    className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium"
                  >
                    Verify
                  </button>
                </Popconfirm>
              </div>
            ) : doctor.adminVerified === 1 ? (
              <span className="text-green-600 font-semibold flex items-center text-sm sm:text-base">
                <FaCheckCircle className="mr-1 w-4 h-4 sm:w-5 sm:h-5" /> Verified
              </span>
            ) : (
              <span className="text-red-600 font-semibold flex items-center text-sm sm:text-base">
                <FaTimesCircle className="mr-1 w-4 h-4 sm:w-5 sm:h-5" /> Rejected
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDoctorDetails;