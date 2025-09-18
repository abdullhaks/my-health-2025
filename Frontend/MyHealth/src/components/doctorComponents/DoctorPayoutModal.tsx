import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

interface BankDetails {
  bankAccNo?: string;
  bankAccHolderName?: string;
  bankIfscCode?: string;
}

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: BankDetails) => void;
  initialData: BankDetails;
}

const DoctorPayoutModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}: PayoutModalProps) => {
  const [formData, setFormData] = useState<BankDetails>(initialData);
  const [errors, setErrors] = useState<Partial<BankDetails>>({});

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
      case "bankAccNo":
        if (value && !/^[0-9]{9,18}$/.test(value))
          error = "Bank account number must be 9-18 digits";
        break;
      case "bankAccHolderName":
        if (value && !/^[a-zA-Z\s.-]+$/.test(value))
          error =
            "Account holder name can only contain letters, spaces, periods, or hyphens";
        break;
      case "bankIfscCode":
        if (value && !/^[A-Z]{4}[0][A-Z0-9]{6}$/.test(value))
          error = "Invalid IFSC code format (e.g., SBIN0001234)";
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BankDetails> = {};

    if (formData.bankAccNo && !/^[0-9]{9,18}$/.test(formData.bankAccNo)) {
      newErrors.bankAccNo = "Bank account number must be 9-18 digits";
    }

    if (
      formData.bankAccHolderName &&
      !/^[a-zA-Z\s.-]+$/.test(formData.bankAccHolderName)
    ) {
      newErrors.bankAccHolderName =
        "Account holder name can only contain letters, spaces, periods, or hyphens";
    }

    if (
      formData.bankIfscCode &&
      !/^[A-Z]{4}[0][A-Z0-9]{6}$/.test(formData.bankIfscCode)
    ) {
      newErrors.bankIfscCode = "Invalid IFSC code format (e.g., SBIN0001234)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("after vaidation.........");
      await onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 sm:p-6 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl relative overflow-hidden transform transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
            Payout Request
          </h2>
          <button
            onClick={onClose}
            className="p-2 sm:p-3 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-200 min-w-[44px] min-h-[44px]"
            aria-label="Close"
          >
            <FiX className="text-lg sm:text-xl" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          {/* Bank Account Number */}
          <div className="space-y-2">
            <label
              htmlFor="bankAccNo"
              className="block text-sm sm:text-base font-medium text-gray-700"
            >
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
            {errors.bankAccNo && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                {errors.bankAccNo}
              </p>
            )}
          </div>

          {/* Bank Account Holder Name */}
          <div className="space-y-2">
            <label
              htmlFor="bankAccHolderName"
              className="block text-sm sm:text-base font-medium text-gray-700"
            >
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
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                {errors.bankAccHolderName}
              </p>
            )}
          </div>

          {/* IFSC Code */}
          <div className="space-y-2">
            <label
              htmlFor="bankIfscCode"
              className="block text-sm sm:text-base font-medium text-gray-700"
            >
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
            {errors.bankIfscCode && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                {errors.bankIfscCode}
              </p>
            )}
          </div>

          {/* Buttons */}
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
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorPayoutModal;
