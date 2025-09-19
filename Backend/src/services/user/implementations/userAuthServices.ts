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

console.log("User auth service is running....");

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
    console.log("user data from service....", userData);

    if (!userData.email || !userData.password) {
      throw new Error("Please provide all required fields");
    }

    const existingUser = await this._userRepository.findByEmail(userData.email);
    console.log("Existing user: ", existingUser);

    if (!existingUser) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      userData.password,
      existingUser.password
    );
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    if (existingUser.isBlocked) {
      return {
        user: { email: existingUser.email, isBlocked: true },
        message: "User is blocked",
      };
    }

    if (!existingUser.isVerified) {
      const otp = generateOtp();
      await this.sendMail(existingUser.email, otp);
      console.log("OTP sent to email: ", existingUser.email);

      return {
        user: { email: existingUser.email, isVerified: false },
        message: "User not verified, OTP sent",
      };
    }

    const accessToken = generateAccessToken({
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

    console.log("userDTO........", userDTO);
    return {
      message: "Login successful",
      user: userDTO,
      accessToken,
      refreshToken,
    };
  }

  async signup(userData: IUser): Promise<Partial<IUserResponse>> {
    console.log("user data from service....", userData);

    if (!userData.email || !userData.password || !userData.fullName) {
      throw new Error("Please provide all required fields");
    }

    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    const existingUser = await this._userRepository.findByEmail(userData.email);

    console.log("Existing user: ", existingUser);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const response = await this._userRepository.create(userData);

    const otp = generateOtp();
    console.log("Generated OTP: ", otp);

    await this.sendMail(userData.email, otp);
    console.log("OTP sent to email: ", userData.email);

    return {
      message: "Signup successful. OTP sent to email.",
      email: userData.email, // send this to frontend
    };
  }

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
      const result = await transporter.sendMail(mailOptions, (error, info) => {
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

    console.log("OTP record: ", otpRecord);

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
    console.log("udpate result is ...", reslt);

    console.log("User verified: ", validateUser);

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
    console.log("Generated recovery password:", recoveryPassword);

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

    if (!record) return false;

    const isMatch = record.recoveryPassword === recoveryCode;
    return isMatch;
  }

  async resetPassword(email: string, newPassword: string): Promise<IUser> {
    console.log("email is from rest passwered", email);
    console.log("new pasword is from rest passwered", newPassword);

    const user = await this._userRepository.findByEmail(email);

    console.log("user is from rest passwered", user);
    if (!user) {
      throw new Error("user not found..!");
    }

    const salt = await bcrypt.genSalt(10);
    newPassword = await bcrypt.hash(newPassword, salt);

    console.log(
      "after hashing newPassword is from rest passwered",
      newPassword
    );

    const updatedUser = await this._userRepository.update(user._id.toString(), {
      password: newPassword,
    });
    if (!updatedUser) {
      throw new Error("Failed to update password");
    }
    return updatedUser as IUser;
  }

  async refreshToken(refreshToken: string): Promise<IResponseDTO> {
    // console.log("Refresh token from service: ", refreshToken);
    if (!refreshToken) {
      throw new Error("refresh token not found");
    }

    const verified = verifyRefreshToken(refreshToken);

    // console.log("is verified from refresh token auth service...",verified);

    if (!verified) {
      throw new Error("Invalid refresh token");
    }

    // console.log("verified is ", verified);
    const accessToken = generateAccessToken({
      id: verified.id,
      role: verified.role,
    });

    // console.log("new access token is ...............",accessToken);

    return { accessToken };
  }

  async getMe(email: string): Promise<Partial<IUserResponse>> {
    console.log("get me email....", email);

    if (!email) {
      throw new Error("Invalid credentials");
    }
    const existingUser = await this._userRepository.findByEmail(email);
    console.log("Existing user: ", existingUser);

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
