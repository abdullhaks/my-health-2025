import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiEdit, FiCopy, FiCamera } from "react-icons/fi";
import toast from "react-hot-toast";
import EditDoctorProfileModal from "./DoctorProfileEdit";
import ChangePasswordModal from "./DoctorChangePassword";
import DoctorPayoutModal from "./DoctorPayoutModal";
import { updateProfileImage, updateDoctorProfile, changePassword, payoutRequest } from "../../api/doctor/doctorApi";
import { updateDoctor } from "../../redux/slices/doctorSlices";
import { message } from "antd";
import { payoutDetails, IDoctorData, doctorProfileUpdate, IDoctor } from "../../interfaces/doctor";

const DoctorProfile = () => {
  const doctor = useSelector((state: IDoctorData) => state.doctor.doctor);
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState<IDoctor>(doctor);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  useEffect(() => {
    setProfileData(doctor);
  }, [doctor]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handlePayout = async () => {
    if (doctor.walletBalance < 1) {
      message.warning("You haven't sufficient balance to payout!");
      return;
    }
    setIsPayoutModalOpen(true);
  };

  const handleSaveImage = async () => {
    if (!selectedImage) return;
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("profile", selectedImage);

      const response = await updateProfileImage(formData, doctor._id);
      const updatedDoctor: IDoctor = response.updatedDoctor;
      dispatch(updateDoctor(updatedDoctor));
      setProfileData(updatedDoctor);
      toast.success("Profile image updated!");
    } catch (error) {
      toast.error("Failed to update image.");
    } finally {
      setIsUploading(false);
      setSelectedImage(null);
      setPreviewImage(null);
    }
  };

  const handleCopyReferID = () => {
    navigator.clipboard.writeText(`www.myhealth.com/id:${profileData._id}`);
    toast.success("Refer ID copied!");
  };

  const handleCopyMHID = () => {
    navigator.clipboard.writeText(`MH-DR-${profileData._id.slice(0, 6).toUpperCase()}`);
    toast.success("MH ID copied!");
  };

  const handleProfileUpdate = async (updatedData: doctorProfileUpdate) => {
    try {
      const response = await updateDoctorProfile(updatedData, doctor._id);
      dispatch(updateDoctor(response.updatedDoctor));
      setProfileData(response.updatedDoctor);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  const handlePasswordChange = async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      const response = await changePassword(passwordData, doctor._id);
      if (!response) {
        toast.error("Password change failed");
        return;
      }
      toast.success("Password changed");
    } catch {
      toast.error("Password change failed");
    }
  };

  const handlePayoutRequest = async (payoutDetails: payoutDetails) => {
    try {
      const response = await payoutRequest(payoutDetails, doctor._id);
      if (!response) {
        toast.error("Requesting payout failed");
        return;
      }
      dispatch(updateDoctor(response.data.updatedDoctor));
      toast.success("Payout requested");
    } catch {
      toast.error("Requesting payout failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="p-4 sm:p-6 md:p-8 border-b border-gray-200 flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto md:mx-0 flex-shrink-0">
            <img
              src={
                previewImage ||
                doctor.profile ||
                "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"
              }
              className="w-full h-full object-cover rounded-full border-4 border-blue-100 shadow-sm"
              alt="Doctor Profile"
            />
            <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <FiCamera className="text-lg sm:text-xl text-gray-600" />
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </label>
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Dr. {profileData.fullName}
              </h2>
              {profileData.premiumMembership && (
                <span className="mt-2 sm:mt-0 rounded-full bg-yellow-100 text-yellow-700 text-xs sm:text-sm font-medium px-3 py-1">
                  Premium Doctor ⭐
                </span>
              )}
            </div>
            <div className="mt-3 space-y-2 text-sm sm:text-base text-gray-600">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="truncate max-w-[200px] sm:max-w-[300px]">
                  Refer ID: www.myhealth.com/id:{profileData._id}
                </span>
                <FiCopy
                  className="cursor-pointer text-blue-500 hover:text-blue-600 transition-all duration-200"
                  onClick={handleCopyReferID}
                />
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="truncate max-w-[200px] sm:max-w-[300px]">
                  MH-ID: MH-DR-{profileData._id.slice(0, 6).toUpperCase()}
                </span>
                <FiCopy
                  className="cursor-pointer text-blue-500 hover:text-blue-600 transition-all duration-200"
                  onClick={handleCopyMHID}
                />
              </div>
            </div>
          </div>

          <div className="self-center md:self-start mt-4 md:mt-0">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 min-h-[44px]"
            >
              <FiEdit className="text-lg" />
              Edit
            </button>
          </div>
        </div>

        {/* Image Save/Cancel Buttons */}
        {selectedImage && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50">
            <div className="flex justify-center sm:justify-start gap-3">
              <button
                onClick={handleSaveImage}
                disabled={isUploading}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-all duration-200 min-h-[44px]"
              >
                {isUploading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setPreviewImage(null);
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all duration-200 min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Profile Details Grid */}
        <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 border-t border-gray-200">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Email</p>
            <p className="text-sm sm:text-base truncate">{profileData.email || "Not provided"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Phone</p>
            <p className="text-sm sm:text-base truncate">{profileData.phone || "Not provided"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">DOB</p>
            <p className="text-sm sm:text-base">{profileData.dob || "Not provided"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Gender</p>
            <p className="text-sm sm:text-base">{profileData.gender || "Not provided"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Location</p>
            <p className="text-sm sm:text-base truncate">{profileData.location?.text || "Not provided"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Category</p>
            <p className="text-sm sm:text-base">{profileData.category || "Not provided"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Graduation</p>
            <p className="text-sm sm:text-base">{profileData.graduation || "Not provided"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Experience</p>
            <p className="text-sm sm:text-base">{profileData.experience ? `${profileData.experience} years` : "Not provided"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Medical Reg. No</p>
            <p className="text-sm sm:text-base truncate">{profileData.registerNo || "Not provided"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Bank Account No</p>
            <p className="text-sm sm:text-base truncate">{profileData.bankAccNo || "Not provided"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Account Holder Name</p>
            <p className="text-sm sm:text-base truncate">{profileData.bankAccHolderName || "Not provided"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">IFSC Code</p>
            <p className="text-sm sm:text-base truncate">{profileData.bankIfscCode || "Not provided"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Verification Status</p>
            <p className="text-sm sm:text-base">{profileData.isVerified ? "Verified" : "Not Verified"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Admin Verification</p>
            <p className="text-sm sm:text-base">{profileData.adminVerified ? "Approved" : "Pending"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Report Analysis Fees</p>
            <p className="text-sm sm:text-base">₹{profileData.reportAnalysisFees || 50}</p>
          </div>
        </div>

        {/* Actions Section */}
        <div className="p-4 sm:p-6 md:p-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-center sm:items-start">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Change Password</p>
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="mt-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-blue-600 border border-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 min-h-[44px]"
            >
              Change
            </button>
          </div>
          <div className="flex flex-col items-center sm:items-end">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Earnings</p>
            <p className="text-sm sm:text-base font-semibold text-gray-900">{profileData.walletBalance || 0} ₹</p>
            <button
              onClick={handlePayout}
              className="mt-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-blue-600 border border-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 min-h-[44px]"
            >
              Payout
            </button>
          </div>
        </div>
      </div>

      <EditDoctorProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleProfileUpdate}
        initialData={{
          fullName: doctor.fullName,
          location: doctor.location ?? null,
          dob: doctor.dob || "",
          phone: doctor.phone || "",
          gender: doctor.gender || "",
          graduation: doctor.graduation || "",
          category: doctor.category || "",
          registerNo: doctor.registerNo || "",
          experience: doctor.experience || null,
          specializations: doctor.specializations || [],
          bankAccNo: doctor.bankAccNo || "",
          bankAccHolderName: doctor.bankAccHolderName || "",
          bankIfscCode: doctor.bankIfscCode || "",
        }}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSave={handlePasswordChange}
      />

      <DoctorPayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        onSave={(bankDetails) => {
          handlePayoutRequest({
            bankAccNo: bankDetails.bankAccNo,
            bankAccHolderName: bankDetails.bankAccHolderName,
            bankIfscCode: bankDetails.bankIfscCode,
          });
        }}
        initialData={{
          bankAccNo: doctor.bankAccNo ?? "",
          bankAccHolderName: doctor.bankAccHolderName ?? "",
          bankIfscCode: doctor.bankIfscCode ?? "",
        }}
      />
    </div>
  );
};

export default DoctorProfile;