import { useState } from "react";
import { FiEdit, FiCopy, FiCamera } from "react-icons/fi";
import EditProfileModal from "./EditProfile";
import ChangePasswordModal from "./ChangePassword";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  updateProfile,
  updateProfileImage,
  changePassword,
} from "../../api/user/userApi";
import { updateUser } from "../../redux/slices/userSlices";
import { IUserData, PasswordData } from "../../interfaces/user";
import { userProfileData } from "../../interfaces/user";

const UserProfile = () => {
  const user = useSelector((state: IUserData) => state.user.user);
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState(user);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleCancelImageUpdate = () => {
    setSelectedImage(null);
    setPreviewImage(null);
  };

  const handleSaveImage = async () => {
    if (!selectedImage) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("profile", selectedImage);

      const response = await updateProfileImage(formData, user._id);
      const updatedUser = response.updatedUser;

      dispatch(updateUser(updatedUser));
      setProfileData(updatedUser);

      toast.success("Profile image updated!");
    } catch (error) {
      toast.error("Failed to update image.");
    } finally {
      setIsUploading(false);
      handleCancelImageUpdate();
    }
  };

  const handleCopyReferID = () => {
    navigator.clipboard.writeText("www.myhealth.com/id:asrerefjaadlfj3422");
    toast.success("Refer ID copied to clipboard!");
  };

  const handleProfileUpdate = async (updatedData: userProfileData) => {
    const response = await updateProfile(updatedData, user._id);
    const { updatedUser } = response;

    dispatch(updateUser(updatedUser));
    setProfileData(updatedUser);

    toast.success("Profile updated successfully!");
  };

  const handlePasswordChange = async (passwordData: PasswordData) => {
    try {
      const response = await changePassword(passwordData, user._id);
      if (!response) {
        toast.error("Changing password has been failed");
        return;
      }
      toast.success("Password changed");
    } catch (error) {
      toast.error("Changing password has been failed");
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
              My Profile
            </h1>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 lg:gap-8">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex-shrink-0">
                <img
                  src={
                    previewImage ||
                    profileData.profile ||
                    `https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png`
                  }
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-blue-100 shadow-md"
                />
                <label className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full shadow-md cursor-pointer hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <FiCamera size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">
                  {profileData.fullName}
                </h2>
                <div className="mt-2 sm:mt-3 space-y-2 text-gray-600">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-xs sm:text-sm truncate max-w-[200px] sm:max-w-[300px]">
                      referral: www.myhealth.com/id:{profileData._id}
                    </span>
                    <button
                      onClick={handleCopyReferID}
                      className="p-1.5 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
                      title="Copy Refer ID"
                    >
                      <FiCopy size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-xs sm:text-sm truncate max-w-[200px] sm:max-w-[300px]">
                      medical tags: {profileData.medicalTags || "None"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedImage && (
                <div className="flex flex-col items-center gap-2 mt-4 sm:mt-0">
                  <button
                    onClick={handleSaveImage}
                    disabled={isUploading}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-all disabled:opacity-50 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {isUploading ? "Saving..." : "Save Image"}
                  </button>
                  <button
                    onClick={handleCancelImageUpdate}
                    disabled={isUploading}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="mt-4 sm:mt-0 sm:ml-auto">
                <button
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <FiEdit size={16} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="p-4 sm:p-6 lg:p-8 border-t border-gray-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-500">Location</p>
                <p className="text-sm sm:text-base text-gray-900 truncate">
                  {profileData?.location?.text || "Not provided"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-500">
                  Date of Birth
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {profileData.dob || "Not provided"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-500">Age</p>
                <p className="text-sm sm:text-base text-gray-900">
                  {profileData.dob
                    ? calculateAge(profileData.dob)
                    : "Not provided"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-500">Phone Number</p>
                <p className="text-sm sm:text-base text-gray-900 truncate">
                  {profileData.phone || "Not provided"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-500">
                  Email Address
                </p>
                <p className="text-sm sm:text-base text-gray-900 truncate max-w-[200px] sm:max-w-[300px]">
                  {profileData.email || "Not provided"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-500">Gender</p>
                <p className="text-sm sm:text-base text-gray-900">
                  {profileData.gender || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* General Section */}
          <div className="p-4 sm:p-6 lg:p-8 border-t border-gray-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              General
            </h3>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-6">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <p className="text-sm sm:text-base text-gray-900">
                  Change Password
                </p>
                <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="px-4 py-2 bg-white border border-blue-500 text-blue-500 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Change
                </button>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div>
                  <p className="text-sm sm:text-base text-gray-900">
                    My Wallet
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Balance: {profileData.walletBalance} rs
                  </p>
                </div>
                {/* Uncomment if withdraw functionality is needed */}
                {/* <button className="px-4 py-2 bg-white border border-blue-500 text-blue-500 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300">
                  Withdraw
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          onSave={handleProfileUpdate}
          initialData={{
            fullName: profileData.fullName,
            medicalTags: profileData.medicalTags || "",
            location: profileData.location ?? null,
            dob: profileData.dob || " ",
            phone: profileData.phone || "",
            gender: profileData.gender || "",
          }}
        />

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
          onSave={handlePasswordChange}
        />
      </div>
    </div>
  );
};

export default UserProfile;
