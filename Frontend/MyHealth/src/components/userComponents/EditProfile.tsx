import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import GeoapifyAutocomplete from "../../sharedComponents/GeoapifyAutocomplete";
import { userProfileData as ProfileData } from "../../interfaces/user";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: ProfileData) => void;
  initialData: ProfileData;
}

const EditProfileModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}: EditProfileModalProps) => {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [errors, setErrors] = useState<Partial<ProfileData>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    let error: string | undefined;
    switch (name) {
      case "fullName":
        if (!value.trim()) error = "Full name is required";
        break;
      case "phone":
        if (!/^\+?[0-9\s]{10,15}$/.test(value.replace(/\s/g, "")))
          error = "Invalid phone number format";
        break;
      case "medicalTags":
        if (value.length > 40) error = "Character limit exceeded";
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileData> = {};

    if (!formData.fullName || formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      await onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto relative transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <FiX size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          <div className="space-y-5 sm:space-y-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5"
              >
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Medical Tags */}
            <div>
              <label
                htmlFor="medicalTags"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5"
              >
                Medical Tags
              </label>
              <input
                type="text"
                name="medicalTags"
                value={formData.medicalTags}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  errors.medicalTags ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.medicalTags && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.medicalTags}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5"
              >
                Location
              </label>
              <GeoapifyAutocomplete
                value={formData.location?.text || ""}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, location: val }))
                }
                setError={(error) =>
                  setErrors((prev) => ({ ...prev, locationText: error }))
                }
                className={`w-full text-sm sm:text-base rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  errors.locationText ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.locationText && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.locationText}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label
                htmlFor="dob"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5"
              >
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  errors.dob ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5"
              >
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 9876543210"
                className={`w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5"
              >
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                  errors.gender ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
