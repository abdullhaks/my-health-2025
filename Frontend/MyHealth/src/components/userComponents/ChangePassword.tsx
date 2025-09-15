import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { z } from "zod";
import PasswordInput from '../../sharedComponents/PasswordInput'; 
import { PasswordData } from "../../interfaces/user";

// Schema for change password validation
const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(8, "invalid password")
    .refine((val) => val.trim() === val, {
      message: "No leading or trailing spaces allowed",
    }),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[@$!%*?&#]/, "Include at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (passwordData: PasswordData) => void;
}

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

const ChangePasswordModal = ({ isOpen, onClose, onSave }: ChangePasswordModalProps) => {
  const [formData, setFormData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ChangePasswordData, string>>>({});
  const [touched, setTouched] = useState<Record<keyof ChangePasswordData, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  useEffect(() => {
    const result = changePasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ChangePasswordData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ChangePasswordData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
    }
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = changePasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ChangePasswordData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ChangePasswordData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setTouched({
        currentPassword: true,
        newPassword: true,
        confirmPassword: true,
      });
      return;
    }

    onSave(formData);
    onClose();
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setTouched({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl relative transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">Change Password</h2>
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
            {/* Current Password */}
            <PasswordInput
              id="currentPassword"
              label="Current Password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              error={touched.currentPassword ? errors.currentPassword : ""}
              className="text-sm sm:text-base"
            />

            {/* New Password */}
            <PasswordInput
              id="newPassword"
              label="New Password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              error={touched.newPassword ? errors.newPassword : ""}
              className="text-sm sm:text-base"
            />

            {/* Confirm Password */}
            <PasswordInput
              id="confirmPassword"
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={touched.confirmPassword ? errors.confirmPassword : ""}
              className="text-sm sm:text-base"
            />
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
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;