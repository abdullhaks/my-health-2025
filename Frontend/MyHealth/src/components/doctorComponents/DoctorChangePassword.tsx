import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { z } from "zod";
import PasswordInput from "../../sharedComponents/PasswordInput";

// Validation Schema
const changeDoctorPasswordSchema = z.object({
  currentPassword: z.string()
    .min(8, "Invalid password")
    .refine((val) => val.trim() === val, {
      message: "No leading or trailing spaces allowed",
    }),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/\d/, "Must contain at least one number")
    .regex(/[@$!%*?&#]/, "Include at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

interface ChangeDoctorPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (passwordData: DoctorPasswordData) => void;
}

interface DoctorPasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type ChangeDoctorPasswordData = z.infer<typeof changeDoctorPasswordSchema>;

const ChangeDoctorPassword = ({ isOpen, onClose, onSave }: ChangeDoctorPasswordModalProps) => {
  const [formData, setFormData] = useState<ChangeDoctorPasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ChangeDoctorPasswordData, string>>>({});
  const [touched, setTouched] = useState<Record<keyof ChangeDoctorPasswordData, boolean>>({
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
    const result = changeDoctorPasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ChangeDoctorPasswordData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ChangeDoctorPasswordData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
    }
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = changeDoctorPasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ChangeDoctorPasswordData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ChangeDoctorPasswordData;
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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md sm:max-w-lg relative animate-fadeIn">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">Change Password</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Close"
          >
            <FiX size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-4 sm:space-y-6">
            <PasswordInput
              id="currentPassword"
              label="Current Password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              error={touched.currentPassword ? errors.currentPassword : ""}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
              
            />

            <PasswordInput
              id="newPassword"
              label="New Password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              error={touched.newPassword ? errors.newPassword : ""}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
             
            />

            <PasswordInput
              id="confirmPassword"
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={touched.confirmPassword ? errors.confirmPassword : ""}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
             
            />
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 rounded-xl text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeDoctorPassword;