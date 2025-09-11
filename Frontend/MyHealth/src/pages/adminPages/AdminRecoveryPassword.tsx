import Input from "../../sharedComponents/Input";
import adminLogin from "../../assets/adminLogin.png";
import applogoWhite from "../../assets/applogoWhite.png";
import Button from "../../sharedComponents/Button";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useEffect, useState } from "react";
import { verifyRecoveryPassword } from "../../api/admin/adminApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ApiError } from "../../interfaces/error";

// Define the validation schema
const adminRecPassSchema = z.object({
  recPass: z
    .string()
    .min(10, "Recovery code must be 10 characters")
    .max(10, "Recovery code must be 10 characters")
    .refine((val) => val.trim() === val, {
      message: "No leading or trailing spaces allowed",
    }),
});

// Define interfaces for form data and errors
interface FormData {
  recPass: string;
}

interface FormErrors {
  recPass: string;
}

// // Define interface for API response and error
// interface VerifyResponse {
//   msg: string;
// }

// interface ApiErrorResponse {
//   msg?: string;
// }

function AdminRecoveryPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    recPass: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    recPass: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const [touched, setTouched] = useState({
    recPass: false,
  });

  const email = localStorage.getItem("adminEmail") || "";

  useEffect(() => {
    const result = adminRecPassSchema.safeParse(formData);
    if (!result.success) {
      const errors: FormErrors = { recPass: "" };
      result.error.errors.forEach((err) => {
        errors[err.path[0] as keyof FormErrors] = err.message;
      });
      setErrors(errors);
      setIsFormValid(false);
    } else {
      setErrors({ recPass: "" });
      setIsFormValid(true);
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = adminRecPassSchema.safeParse(formData);

    if (!result.success) {
      const errors: FormErrors = { recPass: "" };
      result.error.errors.forEach((err) => {
        errors[err.path[0] as keyof FormErrors] = err.message;
      });
      setErrors(errors);
      return;
    }

    try {
      const response = await verifyRecoveryPassword({
        email,
        password: formData.recPass,
      });

      if (response?.msg === "Recovery code verified successfully") {
        toast.success("Recovery code verified!");
        navigate("/admin/resetPassword");
      } else {
        toast.error("Invalid recovery code");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error((error as ApiError).response?.data?.msg || "Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen mesh-bg">
      <div className="container mx-auto pt-5 flex justify-start items-center">
        <img
          src={applogoWhite}
          alt="MyHealth Logo"
          className="h-20 object-contain"
        />
      </div>

      <div className="flex flex-1 justify-center items-center">
        <div className="flex items-center justify-center bg-transparent">
          <div className="flex flex-col md:flex-row bg-blue-200 shadow-lg overflow-hidden max-w-4xl w-full rounded-br-lg rounded-tr-lg">
            <div className="md:w-1/2 hidden md:flex justify-center bg-blue-200">
              <img
                src={adminLogin}
                alt="Admin Recovery Illustration"
                className="w-full h-full"
              />
            </div>

            <div className="w-full md:w-1/2 p-8 rounded-lg bg-white">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                Forgot Password (Admin)
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="recPass"
                  name="recPass"
                  label="Recovery Code"
                  type="text"
                  placeholder="Enter recovery code"
                  value={formData.recPass}
                  onChange={handleChange}
                  required
                  className={
                    touched.recPass && errors.recPass ? "border-red-500" : ""
                  }
                  error={touched.recPass ? errors.recPass : ""}
                />

                <Button
                  type="submit"
                  text="Submit"
                  disabled={!isFormValid}
                  className={`text-white ${
                    isFormValid
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-300 cursor-not-allowed"
                  }`}
                />
              </form>

              <p className="text-center text-sm text-gray-600 mt-4">
                Don’t have an account?{" "}
                <span
                  onClick={() => navigate("/admin/signup")}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Signup
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRecoveryPassword;