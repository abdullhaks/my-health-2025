import IAdminAuthService from "../interfaces/IAdminAuthService";
import IAdminRepository from "../../../repositories/interfaces/IAdminRepository";
import { IAdmin } from "../../../dto/adminDTO";
import { inject, injectable } from "inversify";
import bcrypt from "bcryptjs";
import { generateRandomPassword } from "../../../utils/helpers";
import nodemailer from "nodemailer";
import RecoveryPasswordModel from "../../../models/recoveryPassword";
import dotenv from "dotenv";
dotenv.config();
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../utils/jwt";
import { generateRecoveryPasswordMail } from "../../../utils/generateRecoveyPassword";
import { IResponseDTO } from "../../../dto/commonResponseDto"; 
import { adminResponseDTO } from "../../../dto/adminDTO";
import { AdminMapper } from "../../../mappers/admin.mapper";
import { HttpException } from "../../../utils/http.exception";
import { HttpStatusCode } from "../../../utils/enum";


const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

@injectable()
export default class AdminAuthService implements IAdminAuthService {
  constructor(
    @inject("IAdminRepository") private _adminRepository: IAdminRepository
  ) {}

  async login(
    adminData: IAdmin
  ): Promise<{
    message: string;
    admin: adminResponseDTO;
    accessToken: string;
    refreshToken: string;
  }> {

    if (!adminData.email || !adminData.password) {
          throw new HttpException(HttpStatusCode.BAD_REQUEST, 'Please provide all required fields');
    }

    const admin = await this._adminRepository.findByEmail(adminData.email);

    if (!admin) {
          throw new HttpException(HttpStatusCode.BAD_REQUEST, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(
      adminData.password,
      admin.password
    );
    if (!isPasswordValid) {
         throw new HttpException(HttpStatusCode.BAD_REQUEST, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const accessToken = generateAccessToken({
      id: admin._id.toString(),
      role: "admin",
    });
    const refreshToken = generateRefreshToken({
      id: admin._id.toString(),
      role: "admin",
    });



    const adminDto = await AdminMapper.toResponseDTO(admin)

    return {
      message: "Login successful",
      admin: adminDto,
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(
    email: string
  ): Promise<{ message: string; email: string }> {
    if (!email) {
      throw new Error("Email is required");
    }

    const admin = await this._adminRepository.findByEmail(email);

    if (!admin) {
      throw new Error("Admin not found");
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
        email: admin.email,
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

  async refreshToken(refreshToken: string): Promise<IResponseDTO> {
    if (!refreshToken) {
      throw new Error("Refresh token not found");
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
}
