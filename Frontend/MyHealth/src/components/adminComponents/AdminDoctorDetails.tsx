import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaLock, FaUnlock, FaEye, FaFileImage } from "react-icons/fa";
import {
  doctorDetails,
  verifyDoctor,
  declineDoctor,
} from "../../api/admin/adminApi";
import { Popconfirm, Input } from "antd";
import toast from "react-hot-toast";
import { ILocation } from "../../interfaces/doctor";
import ImageViewer from "../../sharedComponents/ImageViewer";

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

interface ImageViewerState {
  isOpen: boolean;
  imageUrl: string;
  title: string;
  description: string;
}

const AdminDoctorDetails = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [imageViewer, setImageViewer] = useState<ImageViewerState>({
    isOpen: false,
    imageUrl: "",
    title: "",
    description: ""
  });

  const openImageViewer = (imageUrl: string, title: string, description: string = "") => {
    setImageViewer({
      isOpen: true,
      imageUrl,
      title,
      description
    });
  };

  const closeImageViewer = () => {
    setImageViewer(prev => ({ ...prev, isOpen: false }));
  };

  const handleVerify = async (id: string) => {
    try {
      await verifyDoctor(id);
      setDoctor((prev) => (prev ? { ...prev, adminVerified: 1 } : prev));
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
      setDoctor((prev) => (prev ? { ...prev, adminVerified: 2 } : prev));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600 font-medium">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg font-semibold">Doctor not found</p>
          <p className="text-gray-500 mt-2">The requested doctor details could not be retrieved.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Doctor Details
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            
            {/* Profile Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-4 py-4 sm:py-8">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
                
                {/* Profile Picture */}
                <div className="relative group">
                  <div className="w-20 h-20 sm:w-20 sm:h-20 lg:w-20 lg:h-20 rounded-full overflow-hidden border-2 border-white shadow-2xl">
                    <img
                      src={
                        doctor.profile
                          ? doctor.profile
                          : "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"
                      }
                      alt="Doctor profile"
                      className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-110"
                      onClick={() => openImageViewer(
                        doctor.profile || "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png",
                        `Dr. ${doctor.fullName}`,
                        "Profile Picture"
                      )}
                    />
                  </div>
                  <button
                    onClick={() => openImageViewer(
                      doctor.profile || "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png",
                      `Dr. ${doctor.fullName}`,
                      "Profile Picture"
                    )}
                    className="absolute bottom-0 right-0 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="View Profile Picture"
                  >
                    <FaEye className="text-blue-600" size={16} />
                  </button>
                </div>

                {/* Doctor Info */}
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                    Dr. {doctor.fullName}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white">
                    <div className="flex items-center justify-center lg:justify-start gap-2">
                      <span className="font-medium">Email:</span>
                      <span className="text-blue-100 break-all">{doctor.email}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start gap-2">
                      <span className="font-medium">Status:</span>
                      {doctor.isBlocked ? (
                        <span className="flex items-center gap-1 bg-red-500 bg-opacity-20 px-3 py-1 rounded-full border border-red-300">
                          <FaLock size={14} />
                          Blocked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-green-500 bg-opacity-20 px-3 py-1 rounded-full border border-green-300">
                          <FaUnlock size={14} />
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 sm:p-8 lg:p-10">
              
              {/* Basic Information */}
              <div className="mb-8 sm:mb-10">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Graduation</label>
                    <p className="text-gray-800 font-medium">{doctor.graduation}</p>
                  </div>
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Registration Number</label>
                    <p className="text-gray-800 font-medium">{doctor.registerNo}</p>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="mb-8 sm:mb-10">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-600 rounded-full"></div>
                  Verification Status
                </h3>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700">Admin Verification:</span>
                    {doctor.adminVerified === 0 ? (
                      <span className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        Pending Review
                      </span>
                    ) : doctor.adminVerified === 1 ? (
                      <span className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                        <FaCheckCircle size={16} />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold">
                        <FaTimesCircle size={16} />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="mb-8 sm:mb-10">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
                  Documents & Certificates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  
                  {/* Graduation Certificate */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-600 rounded-lg">
                        <FaFileImage className="text-white" size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Graduation Certificate</h4>
                        <p className="text-sm text-gray-600">Academic credential</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openImageViewer(
                        doctor.graduationCertificate,
                        "Graduation Certificate",
                        `Academic certificate for Dr. ${doctor.fullName}`
                      )}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <FaEye size={16} />
                      View Certificate
                    </button>
                  </div>

                  {/* Registration Certificate */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-600 rounded-lg">
                        <FaFileImage className="text-white" size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Registration Certificate</h4>
                        <p className="text-sm text-gray-600">Medical license</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openImageViewer(
                        doctor.registrationCertificate,
                        "Registration Certificate",
                        `Medical registration certificate for Dr. ${doctor.fullName}`
                      )}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <FaEye size={16} />
                      View Certificate
                    </button>
                  </div>

                  {/* Verification ID */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-purple-600 rounded-lg">
                        <FaFileImage className="text-white" size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Verification ID</h4>
                        <p className="text-sm text-gray-600">Identity document</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openImageViewer(
                        doctor.verificationId,
                        "Verification ID",
                        `Identity verification document for Dr. ${doctor.fullName}`
                      )}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <FaEye size={16} />
                      View ID
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {doctor.adminVerified === 0 && (
                <div className="bg-gray-50 p-6 sm:p-8 rounded-xl border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-600 rounded-full"></div>
                    Admin Actions
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Popconfirm
                      title="Decline Doctor Application"
                      description={
                        <div className="space-y-3 py-2">
                          <p className="text-sm font-medium text-gray-700">
                            Please provide a reason for rejection:
                          </p>
                          <Input.TextArea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter detailed rejection reason..."
                            className="w-full"
                            rows={3}
                            maxLength={500}
                          />
                          <p className="text-xs text-gray-500">
                            {rejectReason.length}/500 characters
                          </p>
                        </div>
                      }
                      onConfirm={() => handleDecline(doctor._id)}
                      onCancel={() => setRejectReason("")}
                      okText="Submit Rejection"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <button className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2">
                        <FaTimesCircle size={18} />
                        Decline Application
                      </button>
                    </Popconfirm>
                    
                    <Popconfirm
                      title="Verify Doctor"
                      description="Are you sure you want to verify this doctor? This action will allow them to practice on the platform."
                      onConfirm={() => handleVerify(doctor._id)}
                      okText="Verify Doctor"
                      cancelText="Cancel"
                      okButtonProps={{ className: "bg-green-600 hover:bg-green-700 border-green-600" }}
                    >
                      <button className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2">
                        <FaCheckCircle size={18} />
                        Verify Doctor
                      </button>
                    </Popconfirm>
                  </div>
                </div>
              )}

              {/* Status Display for Verified/Rejected */}
              {doctor.adminVerified === 1 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 sm:p-8 rounded-xl border-2 border-green-300">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-green-600 rounded-full">
                      <FaCheckCircle className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-800 mb-1">
                        Doctor Verified
                      </h3>
                      <p className="text-green-700">
                        This doctor has been verified and can now practice on the platform.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {doctor.adminVerified === 2 && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 p-6 sm:p-8 rounded-xl border-2 border-red-300">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-red-600 rounded-full">
                      <FaTimesCircle className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-800 mb-1">
                        Application Rejected
                      </h3>
                      <p className="text-red-700">
                        This doctor's application has been rejected by the admin.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      <ImageViewer
        isOpen={imageViewer.isOpen}
        onClose={closeImageViewer}
        imageUrl={imageViewer.imageUrl}
        title={imageViewer.title}
        description={imageViewer.description}
      />
    </>
  );
};

export default AdminDoctorDetails;