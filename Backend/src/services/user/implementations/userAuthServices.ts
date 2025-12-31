import IUserAuthService from "../interfaces/IUserAuthServices";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import IAnalyticsRepository from "../../../repositories/interfaces/IAnalyticsRepository";
import IOtpRepository from "../../../repositories/interfaces/IOtpRepository";
import { IUser } from "../../../dto/userDTO";
import { IUserResponse } from "../../../dto/userDTO";
import { inject, injectable } from "inversify";
import bcrypt from "bcryptjs";
import generateOtp from "../../../utils/helpers";
import { generateRandomPassword } from "../../../utils/helpers";
import nodemailer from "nodemailer";
import OtpModel from "../../../models/otp";
import RecoveryPasswordModel from "../../../models/recoveryPassword";
import { generateOtpMail } from "../../../utils/generateOtpMail";
import dotenv from "dotenv";
dotenv.config();
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../utils/jwt";
import { generateRecoveryPasswordMail } from "../../../utils/generateRecoveyPassword";
import { IResponseDTO } from "../../../dto/commonResponseDto";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import { UserMapper } from "../../../mappers/user.mapper";
import { AuthResponseDTO } from "../../../dto/userDTO";
import { UserLoginRequestDTO } from "../../../dto/userDTO";
import { HttpStatusCode } from "../../../utils/enum";
import { HttpException, ValidationException } from "../../../utils/http.exception";
import { z } from "zod";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

@injectable()
export default class UserAuthService implements IUserAuthService {
  constructor(
    @inject("IUserRepository") private _userRepository: IUserRepository,
    @inject("IAnalyticsRepository")
    private _analyticsRepository: IAnalyticsRepository,
    @inject("IOtpRepository") private _otpRepository: IOtpRepository
  ) {}

async login(userData: UserLoginRequestDTO): Promise<AuthResponseDTO> {

    console.log("login data:", userData);

  if (!userData.email || !userData.password) {
    console.log("Missing email or password in login data:", userData);
    throw new HttpException(HttpStatusCode.BAD_REQUEST, 'Please provide all required fields');
  }

  const existingUser = await this._userRepository.findByEmail(userData.email);
  if (!existingUser) {
    console.log("No user found with email:", userData.email);

    throw new HttpException(HttpStatusCode.BAD_REQUEST, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(userData.password, existingUser.password);
  if (!isPasswordValid) {
    console.log("Invalid password for user:", userData.email);
    throw new HttpException(HttpStatusCode.BAD_REQUEST, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  // ---- BLOCKED ----
  if (existingUser.isBlocked) {
    console.log("User is blocked:", userData.email);
    return {
      message: 'User is blocked',
      user: { email: existingUser.email, isBlocked: true },
    };
  }

  // ---- NOT VERIFIED ----
  if (!existingUser.isVerified) {
    console.log("User not verified:", userData.email);
    const otp = generateOtp();
    await this.sendMail(existingUser.email, otp);   // <-- await!
    return {
      message: 'User not verified, OTP sent',
      user: { email: existingUser.email, isVerified: false },
    };
  }

 
  const accessToken  = generateAccessToken({
      id: existingUser._id.toString(),
      role: "user",
    });
  const refreshToken = generateRefreshToken({
      id: existingUser._id.toString(),
      role: "user",
    });

  if (existingUser.profile) {
    existingUser.profile = await getSignedImageURL(existingUser.profile);
  }

  const userDTO = await UserMapper.toUserResponseDTO(existingUser);

  return {
    message: 'Login successful',
    user: userDTO,
    accessToken,
    refreshToken,
  };
};


async signup(userData: IUser): Promise<Partial<IUserResponse>> {

  const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    fullName: z
      .string()
      .min(3, "Full name must be at least 3 characters")
      .max(30, "Full name must be at most 30 characters")
      .refine((val) => val.trim() === val, {
        message: "No leading or trailing spaces allowed",
      }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one digit")
      .regex(/[@$!%*?&#]/, "Include at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });


const parseResult = signupSchema.safeParse(userData);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string> = {};
    parseResult.error.issues.forEach((err) => {
      const firstPath = err.path[0];
      const field =
        typeof firstPath === "string" || typeof firstPath === "number"
          ? String(firstPath)
          : undefined;
      if (field) fieldErrors[field] = err.message;
    });
    throw new ValidationException(fieldErrors);
  }

  const { email, fullName, password } = parseResult.data;

  const existingUser = await this._userRepository.findByEmail(email);
  if (existingUser) {
    throw new ValidationException({ email: "Email already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  userData.password = hashedPassword;
 const response = await this._userRepository.create(userData);

  const otp = generateOtp();
  await this.sendMail(email, otp);

  return {
    message: "Signup successful. OTP sent to email.",
    email: response.email,
  };
};



async sendMail(email: string, otp: string): Promise<void> {
    const otpRecord = new OtpModel({
      email: email,
      otp: otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // OTP valid for 5 minutes
    });

    otpRecord.save();

    const expirationTime = "2 minutes";

    const mailOptions = generateOtpMail(email, otp, expirationTime);
    console.log("Mail options: ", mailOptions);
    try {
      const result = transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email: ", error);
          throw new Error("Error sending email");
        }
        console.log("Email sent: ", info.response);
      });
    } catch (error) {
      console.log(error);
      throw new Error("Error in sending mail");
    }
  }

  async verifyOtp(email: string, otp: string): Promise<Partial<IUserResponse>> {
    const otpRecord = await this._otpRepository.findLatestOtpByEmail(email);


    if (!otpRecord) {
      throw new Error("Invalid OTP or email");
    }

    const isOtpValid = otpRecord.otp === otp;
    if (!isOtpValid) {
      throw new Error("Invalid OTP");
    }

    const validateUser = await this._userRepository.verifyUser(email);
    if (!validateUser) {
      throw new Error("otp verification failed");
    }

    const reslt = await this._analyticsRepository.uptadeOneWithUpsert(
      { dataSet: "1" },
      { $inc: { totalUsers: 1 } }
    );


    return { message: "OTP verified successfully" };
  }

  async resentOtp(email: string): Promise<Partial<IUserResponse>> {
    if (!email) {
      throw new Error("Email is required");
    }

    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.isVerified) {
      throw new Error("User is already verified");
    }

    const otp = generateOtp();

    // Save OTP to DB
    const otpRecord = new OtpModel({
      email,
      otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    await otpRecord.save();

    // Send OTP email
    const expirationTime = "2 minutes";
    const mailOptions = generateOtpMail(email, otp, expirationTime);

    try {
      await transporter.sendMail(mailOptions);
      return { message: "OTP resent to your email" };
    } catch (err) {
      console.error("Error sending OTP:", err);
      throw new Error("Failed to send OTP");
    }
  }

  async forgotPassword(email: string): Promise<Partial<IUserResponse>> {
    if (!email) {
      throw new Error("Email is required");
    }

    const user = await this._userRepository.findByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    const recoveryPassword = generateRandomPassword(10);

    const recoveryRecord = new RecoveryPasswordModel({
      email,
      recoveryPassword,
      createdAt: Date.now(),
    });

    await recoveryRecord.save();

    const mailOptions = generateRecoveryPasswordMail(email, recoveryPassword);

    try {
      await transporter.sendMail(mailOptions);
      return {
        message: "Recovery password sent to your email",
        email: user.email,
      };
    } catch (error) {
      console.error("Error sending recovery email:", error);
      throw new Error("Failed to send recovery email");
    }
  }

  async verifyRecoveryPassword(
    email: string,
    recoveryCode: string
  ): Promise<boolean> {
    const record = await RecoveryPasswordModel.findOne({ email }).sort({
      createdAt: -1,
    });

    console.log("Recovery record found:", record);

    if (!record) return false;

    const isMatch = record.recoveryPassword === recoveryCode;

    console.log("Recovery code match:", isMatch);
    return isMatch;
  }

  async resetPassword(email: string, newPassword: string): Promise<IUser> {


    const user = await this._userRepository.findByEmail(email);

    if (!user) {
      throw new Error("user not found..!");
    }

    const salt = await bcrypt.genSalt(10);
    newPassword = await bcrypt.hash(newPassword, salt);

 

    const updatedUser = await this._userRepository.update(user._id.toString(), {
      password: newPassword,
    });
    if (!updatedUser) {
      throw new Error("Failed to update password");
    }
    return updatedUser as IUser;
  }

  async refreshToken(refreshToken: string): Promise<IResponseDTO> {
    if (!refreshToken) {
      throw new Error("refresh token not found");
    }

    const verified = verifyRefreshToken(refreshToken);


    if (!verified) {
      throw new Error("Invalid refresh token");
    }

    const accessToken = generateAccessToken({
      id: verified.id,
      role: verified.role,
    });


    return { accessToken };
  }

  async getMe(refreshToken: string): Promise<Partial<IUserResponse>> {

    if (!refreshToken) {
      throw new Error("Invalid credentials");
    };


    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new Error("Invalid credentials");
    }

    let id = decoded.id;


    const existingUser = await this._userRepository.findOne({_id:id});

    if (!existingUser) {
      throw new Error("Invalid credentials");
    }

    const { password, ...userWithoutPassword } = existingUser.toObject();

    if (userWithoutPassword.profile) {
      userWithoutPassword.profile = await getSignedImageURL(
        userWithoutPassword.profile
      );
    }

    return {
      message: "Login successful",
      user: userWithoutPassword,
    };
  }
}
