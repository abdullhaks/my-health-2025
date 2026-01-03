import { inject, injectable } from "inversify";
import IAdminDoctorService from "../interfaces/IAdminDoctorService";
import IAdminRepository from "../../../repositories/interfaces/IAdminRepository";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { generateDeclineMail } from "../../../utils/generateSignupDeclineMail";
import { IDoctor } from "../../../dto/doctorDTO";

dotenv.config();

// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// });



const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});


@injectable()
export default class AdminDoctorService implements IAdminDoctorService {
  constructor(
    @inject("IAdminRepository") private _adminRepository: IAdminRepository,
    @inject("IDoctorRepository") private _doctorRepository: IDoctorRepository
  ) {}

  async getDoctors(
    page: number,
    search: string | undefined,
    limit: number,
    onlyPremium: boolean,
    toVerify: boolean
  ): Promise<{ doctors: IDoctor[] | null; totalPages: number }> {
    const response = await this._doctorRepository.getDoctors(
      page,
      search,
      limit,
      onlyPremium,
      toVerify
    );

    if (!response) {
      throw new Error("doctors not found..!");
    }

    return response;
  }

  async getDoctor(id: string): Promise<IDoctor> {
    const response = await this._doctorRepository.getDoctor(id);
    if (!response) {
      throw new Error("doctor not found..!");
    }

    const { password, ...userWithoutPassword } = response.toObject();
    if (userWithoutPassword.profile) {
      userWithoutPassword.profile = await getSignedImageURL(response.profile);
    }

    userWithoutPassword.graduationCertificate = await getSignedImageURL(response.graduationCertificate);
    userWithoutPassword.registrationCertificate =await getSignedImageURL(response.registrationCertificate);
    userWithoutPassword.verificationId =await getSignedImageURL(response.verificationId);
    
    return userWithoutPassword;
  }

  async verifyDoctor(id: string): Promise<IDoctor> {

    const response = await this._doctorRepository.update(id,
        { adminVerified: 1 }

    )


    if (!response) {
      throw new Error("doctor verifying failed");
    }
    return response;
  }

  async declineDoctor(id: string, reason: string): Promise<{  response: IDoctor; mailData?: any}> {
    const response = await this._doctorRepository.update(id,
        { adminVerified: 3, rejectionReason: reason });

    if (!response) {
      throw new Error("doctor declining failed");
    }

    const doctor = await this._doctorRepository.getDoctor(id);
    if (!doctor || !doctor.email) {
    throw new Error("doctor declining failed");
    }
    // Send decline email
    try {
        // const mailOptions = generateDeclineMail(doctor.email, reason);
        // await transporter.sendMail(mailOptions);

      const mailData = {
        app: 'MyHealth',
        logo:"https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/app-images/applogoblue.png",
        heading : 'Signup Application Declined',
        email: doctor.email,
        mainMsg: 'We regret to inform you that your application to join MyHealth as a doctor has been declined. Please find the reason for the decline below:',
        cred: reason,
        secMsg: 'If you have any questions or require further clarification, feel free to contact our support team.',
        date:new Date().toLocaleDateString()
      };

      return {response, mailData};

    } catch (error) {
      console.error("Error sending decline email:", error);
    }

    return {response};
  }

  async block(id: string): Promise<IDoctor | null> {
    const response = await this._doctorRepository.blockDoctor(id);


    return response;
  }

  async unblock(id: string): Promise<IDoctor | null> {
    const response = await this._doctorRepository.unblockDoctor(id);


    return response;
  }
}
