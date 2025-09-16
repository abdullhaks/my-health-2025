import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import GeoapifyAutocomplete from "../../sharedComponents/GeoapifyAutocomplete";
import { doctorProfileUpdate, ILocation, ISpecialization } from "../../interfaces/doctor";

interface DoctorProfileData {
  fullName: string;
  location: ILocation | null;
  dob: string;
  phone: string;
  gender: string;
  graduation: string;
  category: string;
  registerNo: string;
  experience: number | null;
  specializations: ISpecialization[];
  bankAccNo: string;
  bankAccHolderName: string;
  bankIfscCode: string;
}

interface EditDoctorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: doctorProfileUpdate) => void;
  initialData: DoctorProfileData;
}

const EditDoctorProfileModal = ({ isOpen, onClose, onSave, initialData }: EditDoctorProfileModalProps) => {
  const [formData, setFormData] = useState<DoctorProfileData>(initialData);
  const [/*specializationInput*/, setSpecializationInput] = useState<string>("");
  const [/*certificateInput*/, setCertificateInput] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setErrors({});
      setSpecializationInput("");
      setCertificateInput("");
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let error: string | undefined;
    switch (name) {
      case "fullName":
        if (!value.trim()) error = "Full name is required";
        else if (value.length < 3) error = "Full name must be at least 3 characters";
        else if (!/^[a-zA-Z\s.-]+$/.test(value)) error = "Full name can only contain letters, spaces, periods, or hyphens";
        break;
      case "phone":
        if (value && !/^\+?[0-9\s]{10,15}$/.test(value.replace(/\s/g, "")))
          error = "Invalid phone number format (10-15 digits)";
        break;
      case "dob":
        if (!value) error = "Date of birth is required";
        else {
          const dob = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
          if (age < 18) error = "Doctor must be at least 18 years old";
        }
        break;
      case "gender":
        if (!value) error = "Gender is required";
        break;
      case "graduation":
        if (!value.trim()) error = "Graduation is required";
        else if (!/^[a-zA-Z\s,]+$/.test(value)) error = "Graduation can only contain letters, spaces, or commas";
        break;
      case "category":
        if (!value.trim()) error = "Category is required";
        else if (!/^[a-zA-Z\s-]+$/.test(value)) error = "Category can only contain letters, spaces, or hyphens";
        break;
      case "registerNo":
        if (!value.trim()) error = "Registration number is required";
        else if (!/^[A-Za-z0-9]+$/.test(value)) error = "Registration number can only contain letters and numbers";
        break;
      case "experience":
        if (value && (isNaN(Number(value)) || Number(value) < 0)) error = "Experience must be a non-negative number";
        else if (value && Number(value) > 50) error = "Experience cannot exceed 50 years";
        break;
      case "bankAccNo":
        if (value && !/^[0-9]{9,18}$/.test(value)) error = "Bank account number must be 9-18 digits";
        break;
      case "bankAccHolderName":
        if (value && !/^[a-zA-Z\s.-]+$/.test(value))
          error = "Account holder name can only contain letters, spaces, periods, or hyphens";
        break;
      case "bankIfscCode":
        if (value && !/^[A-Z]{4}[0][A-Z0-9]{6}$/.test(value)) error = "Invalid IFSC code format (e.g., SBIN0001234)";
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string | undefined } = {};

    if (!formData.fullName || formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    } else if (!/^[a-zA-Z\s.-]+$/.test(formData.fullName)) {
      newErrors.fullName = "Full name can only contain letters, spaces, periods, or hyphens";
    }

    if (
      !formData.location ||
      (formData.location && !formData.location.text || !formData.location.coordinates)
    ) {
      newErrors.location = "Location is required";
    }

    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const dob = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18) newErrors.dob = "Doctor must be at least 18 years old";
    }

    if (formData.phone && !/^\+?[0-9\s]{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Invalid phone number format (10-15 digits)";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.graduation || formData.graduation.trim().length === 0) {
      newErrors.graduation = "Graduation is required";
    } else if (!/^[a-zA-Z\s,]+$/.test(formData.graduation)) {
      newErrors.graduation = "Graduation can only contain letters, spaces, or commas";
    }

    if (!formData.category || formData.category.trim().length === 0) {
      newErrors.category = "Category is required";
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.category)) {
      newErrors.category = "Category can only contain letters, spaces, or hyphens";
    }

    if (!formData.registerNo || formData.registerNo.trim().length === 0) {
      newErrors.registerNo = "Registration number is required";
    } else if (!/^[A-Za-z0-9]+$/.test(formData.registerNo)) {
      newErrors.registerNo = "Registration number can only contain letters and numbers";
    }

    if (formData.experience && (isNaN(Number(formData.experience)) || Number(formData.experience) < 0)) {
      newErrors.experience = "Experience must be a non-negative number";
    } else if (formData.experience && Number(formData.experience) > 50) {
      newErrors.experience = "Experience cannot exceed 50 years";
    }

    if (formData.bankAccNo && !/^[0-9]{9,18}$/.test(formData.bankAccNo)) {
      newErrors.bankAccNo = "Bank account number must be 9-18 digits";
    }

    if (formData.bankAccHolderName && !/^[a-zA-Z\s.-]+$/.test(formData.bankAccHolderName)) {
      newErrors.bankAccHolderName = "Account holder name can only contain letters, spaces, periods, or hyphens";
    }

    if (formData.bankIfscCode && !/^[A-Z]{4}[0][A-Z0-9]{6}$/.test(formData.bankIfscCode)) {
      newErrors.bankIfscCode = "Invalid IFSC code format (e.g., SBIN0001234)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData: doctorProfileUpdate = {
        ...formData,
        location: formData.location || undefined,
        experience: formData.experience === null ? undefined : formData.experience,
      };
      await onSave(submitData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] flex flex-col relative overflow-hidden transition-transform duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">Edit Doctor Profile</h2>
          <button
            onClick={onClose}
            className="p-2 sm:p-3 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-200 min-w-[44px] min-h-[44px]"
            aria-label="Close"
          >
            <FiX className="text-lg sm:text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm sm:text-base font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.fullName && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.fullName}</p>}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm sm:text-base font-medium text-gray-700">
                Location
              </label>
              <GeoapifyAutocomplete
                value={formData.location?.text || ""}
                onChange={(val: ILocation) => setFormData((prev) => ({ ...prev, location: val }))}
                setError={(error) => setErrors((prev) => ({ ...prev, location: error }))}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.location ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.location && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.location}</p>}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label htmlFor="dob" className="block text-sm sm:text-base font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.dob ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.dob && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.dob}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm sm:text-base font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 9876543210"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phone && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.phone}</p>}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label htmlFor="gender" className="block text-sm sm:text-base font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.gender ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.gender}</p>}
            </div>

            {/* Graduation */}
            <div className="space-y-2">
              <label htmlFor="graduation" className="block text-sm sm:text-base font-medium text-gray-700">
                Graduation
              </label>
              <input
                type="text"
                name="graduation"
                value={formData.graduation}
                onChange={handleChange}
                placeholder="e.g. MBBS, MD"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.graduation ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.graduation && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.graduation}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm sm:text-base font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Cardiologist, Pediatrician"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.category && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.category}</p>}
            </div>

            {/* Medical Registration Number */}
            <div className="space-y-2">
              <label htmlFor="registerNo" className="block text-sm sm:text-base font-medium text-gray-700">
                Medical Registration Number
              </label>
              <input
                type="text"
                name="registerNo"
                value={formData.registerNo}
                onChange={handleChange}
                placeholder="e.g. MCI123456"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.registerNo ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.registerNo && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.registerNo}</p>}
            </div>

            {/* Years of Experience */}
            <div className="space-y-2">
              <label htmlFor="experience" className="block text-sm sm:text-base font-medium text-gray-700">
                Years of Experience
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience ?? ""}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.experience ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.experience && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.experience}</p>}
            </div>

            {/* Bank Account Number */}
            <div className="space-y-2">
              <label htmlFor="bankAccNo" className="block text-sm sm:text-base font-medium text-gray-700">
                Bank Account Number
              </label>
              <input
                type="text"
                name="bankAccNo"
                value={formData.bankAccNo || ""}
                onChange={handleChange}
                placeholder="Your bank account number"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.bankAccNo ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.bankAccNo && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.bankAccNo}</p>}
            </div>

            {/* Account Holder Name */}
            <div className="space-y-2">
              <label htmlFor="bankAccHolderName" className="block text-sm sm:text-base font-medium text-gray-700">
                Account Holder Name
              </label>
              <input
                type="text"
                name="bankAccHolderName"
                value={formData.bankAccHolderName || ""}
                onChange={handleChange}
                placeholder="Account holder name"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.bankAccHolderName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.bankAccHolderName && (
                <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.bankAccHolderName}</p>
              )}
            </div>

            {/* IFSC Code */}
            <div className="space-y-2">
              <label htmlFor="bankIfscCode" className="block text-sm sm:text-base font-medium text-gray-700">
                IFSC Code
              </label>
              <input
                type="text"
                name="bankIfscCode"
                value={formData.bankIfscCode || ""}
                onChange={handleChange}
                placeholder="e.g. SBIN0001234"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.bankIfscCode ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.bankIfscCode && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.bankIfscCode}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 min-h-[44px]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDoctorProfileModal;