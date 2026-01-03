import { IResponseDTO } from "../../../dto/commonResponseDto";
import { IDoctor } from "../../../dto/doctorDTO";

interface IParsed {
  title?: string;
  certificate?: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  };
}

interface ICertificates {
  registrationCertificate:
    | {
        buffer: Buffer<ArrayBufferLike>;
        originalname: string;
        mimetype: string;
      }
    | undefined;
  graduationCertificate:
    | {
        buffer: Buffer<ArrayBufferLike>;
        originalname: string;
        mimetype: string;
      }
    | undefined;
  verificationId:
    | {
        buffer: Buffer<ArrayBufferLike>;
        originalname: string;
        mimetype: string;
      }
    | undefined;
}

export default interface IDoctorAuthService {
  login(
    doctorData: Partial<IDoctor>
  ): Promise<{
    message: string;
    doctor: IDoctor;
    accessToken?: string;
    refreshToken?: string;
    mailData?: any;
  }>;
  sendMail(email: string, otp: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<IResponseDTO>;
  signup(
    doctor: Partial<IDoctor>,
    certificates: ICertificates,
    parsedSpecializations: IParsed[]
  ): Promise<{ message: string; doctor: IDoctor; }>;
  verifyOtp(email: string, otp: string): Promise<{ message: string }>;
  resentOtp(email: string): Promise<{ message: string }>;
}
