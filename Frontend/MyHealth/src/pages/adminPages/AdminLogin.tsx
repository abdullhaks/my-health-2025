import Input from "../../sharedComponents/Input";
import adminLoginImg from "../../assets/adminLogin.png";
import applogoWhite from "../../assets/applogoWhite.png";
import Button from "../../sharedComponents/Button";
import { FcGoogle } from "react-icons/fc";
import PasswordInput from "../../sharedComponents/PasswordInput";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useEffect, useState } from "react";
import { loginAdmin } from "../../api/admin/adminApi";
import { useDispatch } from "react-redux";
import { loginAdmin as login, logoutAdmin } from "../../redux/slices/adminSlices";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AxiosError } from "axios"; // Import AxiosError
import { ApiError } from "../../interfaces/error";

// Define the validation schema
const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Define interfaces for form data and errors
interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
}

// Define interface for API error response
interface ApiErrorResponse {
  msg?: string;
}

function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const result = adminLoginSchema.safeParse(formData);
    if (!result.success) {
      const errors: FormErrors = { email: "", password: "" };
      result.error.errors.forEach((err) => {
        errors[err.path[0] as keyof FormErrors] = err.message;
      });
      setErrors(errors);
      setIsFormValid(false);
    } else {
      setErrors({ email: "", password: "" });
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
    const result = adminLoginSchema.safeParse(formData);
    if (!result.success) {
      const errors: FormErrors = { email: "", password: "" };
      result.error.errors.forEach((err) => {
        errors[err.path[0] as keyof FormErrors] = err.message;
      });
      setErrors(errors);
      return;
    }

    try {
      console.log("Form data before login:", formData);
      const response = await loginAdmin(formData);
      console.log("Admin login success:", response);

      dispatch(logoutAdmin());
      dispatch(
        login({
          admin: response.admin,
        })
      );

      toast.success("Logged in as Admin");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error((error as ApiError).response?.data?.msg || "Invalid credentials!");

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as ApiError).response &&
        (error as ApiError).response?.data?.status === 401
      ) {
        setErrors({ ...errors, password: "Invalid email or password" });
      } else {
        setErrors({ ...errors, email: " " });
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen mesh-bg">
      <div className="container mx-auto pt-5 flex justify-start items-center">
        <img src={applogoWhite} alt="Admin Logo" className="h-20 object-contain" />
      </div>

      <div className="flex flex-1 justify-center items-center">
        <div className="flex items-center justify-center bg-transparent">
          <div className="flex flex-col md:flex-row bg-blue-200 shadow-lg overflow-hidden max-w-4xl w-full rounded-br-lg rounded-tr-lg">
            <div className="md:w-1/2 hidden md:flex justify-center bg-blue-200">
              <img src={adminLoginImg} alt="Admin Login" className="w-full h-full" />
            </div>

            <div className="w-full md:w-1/2 p-8 rounded-lg bg-white">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Admin Login</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={touched.email && errors.email ? "border-red-500" : ""}
                  error={touched.email ? errors.email : ""}
                />

                <PasswordInput
                  id="password"
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={touched.password && errors.password ? "border-red-500" : ""}
                  error={touched.password ? errors.password : ""}
                />

                <span
                  onClick={() => navigate("/admin/forgetPassword")}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot password?
                </span>

                <Button
                  type="submit"
                  text="Login"
                  disabled={!isFormValid}
                  className={`text-white ${
                    isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                  }`}
                />

                <Button
                  text="Login with Google"
                  icon={<FcGoogle />}
                  className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-200"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;