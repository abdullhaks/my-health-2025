import { useEffect, useState } from "react";
import Input from "../../sharedComponents/Input";
import PasswordInput from "../../sharedComponents/PasswordInput";
import Button from "../../sharedComponents/Button";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import applogoWhite from "../../assets/applogoWhite.png";
import doctorLogin from "../../assets/doctorLogin.png";
import { signupDoctor } from "../../api/doctor/doctorApi";
import toast from "react-hot-toast";

// Validation schema
const doctorSignupSchema = z
  .object({
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "At least one lowercase letter")
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/\d/, "At least one digit")
      .regex(/[@$!%*?&#]/, "Include at least one special character"),
    confirmPassword: z.string(),
    graduation: z.string(),
    graduationCertificate: z.instanceof(File).nullable(),
    category: z.string(),
    registerNo: z.string().min(6, "Not valid"),
    registrationCertificate: z.instanceof(File).nullable(),
    verificationId: z.instanceof(File).nullable(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type DoctorSignupData = z.infer<typeof doctorSignupSchema>;

function DoctorSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DoctorSignupData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    graduation: "",
    graduationCertificate: null,
    category: "",
    registerNo: "",
    registrationCertificate: null,
    verificationId: null,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof DoctorSignupData, string>>
  >({});
  const [touched, setTouched] = useState<
    Record<keyof DoctorSignupData, boolean>
  >(
    Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key as keyof DoctorSignupData]: false }),
      {} as Record<keyof DoctorSignupData, boolean>
    )
  );

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, files } = e.target as HTMLInputElement;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files?.[0] || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  useEffect(() => {
    const result = doctorSignupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof DoctorSignupData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof DoctorSignupData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
    }
  }, [formData]);

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = doctorSignupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof DoctorSignupData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof DoctorSignupData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, value);
        }
      });

      await signupDoctor(formDataToSend)
        .then((response) => {
          console.log("Signup successful", response);
          navigate("/doctor/login");
        })
        .catch((error) => {
          console.error("Signup error", error);
          setErrors({ email: "Email already exists" });
          toast.error("Email already exists");
        });
    } catch (error) {
      console.error("Doctor signup error:", error);
      toast.error("Invalid inputs. Try again.");
      setErrors({ email: "Signup failed. Try again." });
    } finally {
      setLoading(false);
    }
  };

  // Function to check if the current step is valid
  const isStepValid = (step: number) => {
    if (step === 1) {
      return (
        formData.fullName.length >= 3 &&
        formData.email.length > 0 &&
        formData.password.length >= 8 &&
        formData.confirmPassword.length >= 8 &&
        formData.password === formData.confirmPassword
      );
    }
    if (step === 2) {
      return (
        formData.graduation.length > 0 &&
        formData.category.length > 0 &&
        formData.graduationCertificate !== null
      );
    }
    if (step === 3) {
      return (
        formData.verificationId !== null &&
        formData.registerNo.length > 5 &&
        formData.registrationCertificate !== null
      );
    }
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-200 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-70">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="signupGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="0.5"
                opacity="0.8"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#signupGrid)" />
        </svg>
      </div>

      {/* Floating background elements */}
      <div className="absolute top-10 left-5 w-16 h-16 sm:w-20 sm:h-20 bg-blue-300/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-20 right-10 w-24 h-24 sm:w-32 sm:h-32 bg-purple-300/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-10 left-1/4 w-20 h-20 sm:w-24 sm:h-24 bg-blue-400/20 rounded-full blur-xl animate-pulse delay-2000"></div>

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="container mx-auto flex justify-start items-center">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 bg-blue-300 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/20">
              <img
                src={applogoWhite}
                alt="MyHealth Logo"
                className="w-full h-full object-contain p-1"
              />
            </div>
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-300 drop-shadow-md">
              MyHealth
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <div className="w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 overflow-hidden min-h-[600px] sm:min-h-[700px]">
            {/* Left Side - Illustration (Hidden on mobile) */}
            <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white p-8 xl:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              <div className="relative z-10 max-w-md w-full">
                <img
                  src={doctorLogin}
                  alt="Doctor Signup Illustration"
                  className="w-full h-auto object-contain drop-shadow-lg"
                />
                <div className="text-center mt-6">
                  <h3 className="text-xl xl:text-2xl font-bold text-gray-700 mb-2">
                    Join as a Doctor
                  </h3>
                  <p className="text-sm xl:text-base text-gray-600 leading-relaxed">
                    Register to manage your patients and appointments seamlessly
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12 bg-white">
              <div className="w-full max-w-md mx-auto">
                {/* Mobile Logo (shown only on mobile) */}
                <div className="lg:hidden flex justify-center mb-6 sm:mb-8">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-blue-300 to-blue-600 rounded-2xl shadow-lg overflow-hidden p-2">
                    <img
                      src={applogoWhite}
                      alt="MyHealth Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
                    Doctor Signup - Step {step}/3
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Create your account to start managing your practice
                  </p>
                </div>

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 sm:space-y-6"
                >
                  {step === 1 && (
                    <div className="space-y-4 sm:space-y-5">
                      <Input
                        id="fullName"
                        name="fullName"
                        label="Full Name"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        className={`transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
                          touched.fullName && errors.fullName
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        error={touched.fullName ? errors.fullName : ""}
                      />
                      <Input
                        id="email"
                        name="email"
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        required
                        className={`transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
                          touched.email && errors.email
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        error={touched.email ? errors.email : ""}
                      />
                      <PasswordInput
                        id="password"
                        name="password"
                        label="Password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className={`transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
                          touched.password && errors.password
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        error={touched.password ? errors.password : ""}
                      />
                      <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className={`transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
                          touched.confirmPassword && errors.confirmPassword
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        error={
                          touched.confirmPassword ? errors.confirmPassword : ""
                        }
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4 sm:space-y-5">
                      <Input
                        id="graduation"
                        name="graduation"
                        label="Graduation"
                        value={formData.graduation}
                        onChange={handleChange}
                        placeholder="Enter your graduation details"
                        required
                        className={`transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
                          touched.graduation && errors.graduation
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        error={touched.graduation ? errors.graduation : ""}
                      />
                      <Input
                        id="graduationCertificate"
                        name="graduationCertificate"
                        label="Graduation Certificate"
                        type="file"
                        onChange={handleChange}
                        required
                        className={`transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
                          touched.graduationCertificate &&
                          errors.graduationCertificate
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        error={
                          touched.graduationCertificate
                            ? errors.graduationCertificate
                            : ""
                        }
                      />
                      <div className="flex flex-col">
                        <label
                          htmlFor="category"
                          className="mb-1 text-sm sm:text-base text-gray-700 font-medium"
                        >
                          Category
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className={`border rounded-lg p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                            touched.category && errors.category
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : "border-gray-300"
                          }`}
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="General Physician">
                            General Physician
                          </option>
                          <option value="Cardiologist">Cardiologist</option>
                          <option value="Dermatologist">Dermatologist</option>
                          <option value="Endocrinologist">
                            Endocrinologist
                          </option>
                          <option value="Gastroenterologist">
                            Gastroenterologist
                          </option>
                          <option value="Neurologist">Neurologist</option>
                          <option value="Nephrologist">Nephrologist</option>
                          <option value="Oncologist">Oncologist</option>
                          <option value="Orthopedic Surgeon">
                            Orthopedic Surgeon
                          </option>
                          <option value="Pediatrician">Pediatrician</option>
                          <option value="Psychiatrist">Psychiatrist</option>
                          <option value="Pulmonologist">Pulmonologist</option>
                          <option value="Radiologist">Radiologist</option>
                          <option value="Rheumatologist">Rheumatologist</option>
                          <option value="Surgeon">Surgeon</option>
                          <option value="Urologist">Urologist</option>
                          <option value="ENT Specialist">ENT Specialist</option>
                          <option value="Ophthalmologist">
                            Ophthalmologist
                          </option>
                          <option value="Gynecologist">Gynecologist</option>
                          <option value="Dentist">Dentist</option>
                          <option value="Physiotherapist">
                            Physiotherapist
                          </option>
                          <option value="Dietitian/Nutritionist">
                            Dietitian/Nutritionist
                          </option>
                          <option value="Emergency Medicine">
                            Emergency Medicine
                          </option>
                          <option value="Pathologist">Pathologist</option>
                          <option value="Family Medicine">
                            Family Medicine
                          </option>
                          <option value="Hematologist">Hematologist</option>
                          <option value="Plastic Surgeon">
                            Plastic Surgeon
                          </option>
                          <option value="Anesthesiologist">
                            Anesthesiologist
                          </option>
                          <option value="Sports Medicine">
                            Sports Medicine
                          </option>
                          <option value="Other">Other</option>
                        </select>
                        {touched.category && errors.category && (
                          <span className="text-sm text-red-500 mt-1">
                            {errors.category}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4 sm:space-y-5">
                      <Input
                        id="registerNo"
                        name="registerNo"
                        label="Register Number"
                        value={formData.registerNo}
                        onChange={handleChange}
                        placeholder="Enter your register number"
                        required
                        className={`transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
                          touched.registerNo && errors.registerNo
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        error={touched.registerNo ? errors.registerNo : ""}
                      />
                      <Input
                        id="registrationCertificate"
                        name="registrationCertificate"
                        label="Registration Certificate"
                        type="file"
                        onChange={handleChange}
                        required
                        className={`transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
                          touched.registrationCertificate &&
                          errors.registrationCertificate
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        error={
                          touched.registrationCertificate
                            ? errors.registrationCertificate
                            : ""
                        }
                      />
                      <Input
                        id="verificationId"
                        name="verificationId"
                        label="Verification ID"
                        type="file"
                        onChange={handleChange}
                        required
                        className={`transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
                          touched.verificationId && errors.verificationId
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        error={
                          touched.verificationId ? errors.verificationId : ""
                        }
                      />
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4 sm:pt-6 gap-4">
                    {step > 1 && (
                      <Button
                        type="button"
                        text="Back"
                        onClick={prevStep}
                        className="w-full min-h-[48px] sm:min-h-[52px] text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 transform bg-gray-500 text-white hover:bg-gray-600 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                      />
                    )}
                    {step < 3 ? (
                      <Button
                        type="button"
                        text="Next"
                        onClick={nextStep}
                        disabled={!isStepValid(step)}
                        className={`w-full min-h-[48px] sm:min-h-[52px] text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 transform ${
                          isStepValid(step)
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      />
                    ) : (
                      <Button
                        type="submit"
                        text={loading ? "Signing up..." : "Signup"}
                        disabled={!isStepValid(step) || loading}
                        className={`w-full min-h-[48px] sm:min-h-[52px] text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 transform ${
                          isStepValid(step) && !loading
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      />
                    )}
                  </div>
                </form>

                {/* Login Link */}
                <div className="text-center mt-6 sm:mt-8 pt-4 border-t border-gray-100">
                  <p className="text-sm sm:text-base text-gray-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/doctor/login")}
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200 min-h-[44px] inline-flex items-center"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DoctorSignup;
