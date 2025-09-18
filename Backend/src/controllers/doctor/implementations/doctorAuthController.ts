import { NextFunction, Request, Response } from "express";
import IDoctorAuthCtrl from "../interfaces/IDoctorAuthCtrl";
import { inject, injectable } from "inversify";
import IDoctorAuthService from "../../../services/doctor/interfaces/IDoctorAuthServices";
import { HttpStatusCode } from "../../../utils/enum";
import { MESSAGES } from "../../../utils/messages";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

type MulterFiles = {
  [fieldname: string]: MulterFile[];
};

@injectable()
export default class DoctorAuthController implements IDoctorAuthCtrl {
  constructor(
    @inject("IDoctorAuthService") private _doctorAuthService: IDoctorAuthService
  ) {}

  async doctorLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await this._doctorAuthService.login(res, {
        email,
        password,
      });

      console.log("result is ", result);

      if (!result) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "Envalid credentials" });
        return;
      }

     

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        sameSite: "none", // allow cross-site
        secure: true, // only over HTTPS
        maxAge: parseInt(process.env.MAX_AGE || "604800000"),
      });

      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: parseInt(process.env.MAX_AGE || "604800000"),
      });

      res.cookie("doctorEmail", result.doctor.email, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: parseInt(process.env.MAX_AGE || "604800000"),
      });

      res
        .status(HttpStatusCode.OK)
        .json({ message: result.message, doctor: result.doctor });
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  };

    async doctorLogout(req: Request, res: Response): Promise<void> {
      try {
        console.log("log out ............ ctrl....");
        res.clearCookie("refreshToken", {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
  
        res.clearCookie("accessToken", {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
  
        res
          .status(HttpStatusCode.OK)
          .json({ message: MESSAGES.server.serverError });
      } catch (error) {
        console.log(error);
      }
    }

  async doctorSignup(req: Request, res: Response): Promise<void> { 
    try {
      const { fullName, email, password, graduation, category, registerNo } =
        req.body;

      const parsedSpecializations: {
        title: string;
        certificate?: MulterFile;
      }[] = [];

      let i = 0;
      while (req.body[`specializations[${i}][title]`]) {
        parsedSpecializations.push({
          title: req.body[`specializations[${i}][title]`],
          certificate: (req.files as MulterFiles)?.[
            `specializations[${i}][certificate]`
          ]?.[0],
        });
        i++;
      }

      const doctor = {
        fullName,
        email,
        password,
        graduation,
        category,
        registerNo,
      };

      const registrationCertificateFile = (req.files as MulterFiles)
        ?.registrationCertificate?.[0];
      const graduationCertificateFile = (req.files as MulterFiles)
        ?.graduationCertificate?.[0];
      const verificationIdFile = (req.files as MulterFiles)
        ?.verificationId?.[0];

      const certificates = {
        registrationCertificate: registrationCertificateFile
          ? {
              buffer: registrationCertificateFile.buffer,
              originalname: registrationCertificateFile.originalname,
              mimetype: registrationCertificateFile.mimetype,
            }
          : undefined,
        graduationCertificate: graduationCertificateFile
          ? {
              buffer: graduationCertificateFile.buffer,
              originalname: graduationCertificateFile.originalname,
              mimetype: graduationCertificateFile.mimetype,
            }
          : undefined,
        verificationId: verificationIdFile
          ? {
              buffer: verificationIdFile.buffer,
              originalname: verificationIdFile.originalname,
              mimetype: verificationIdFile.mimetype,
            }
          : undefined,
      };

      console.log(
        "files are",
        certificates.registrationCertificate,
        certificates.graduationCertificate,
        certificates.verificationId
      );

      const response = await this._doctorAuthService.signup(
        doctor,
        certificates,
        parsedSpecializations
      );

      res
        .status(HttpStatusCode.CREATED)
        .json({ message: "Doctor signed up successfully!" });
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { otp, email } = req.body;

      console.log(`otp is ${otp} & email is ${email}`);

      const otpRecord = await this._doctorAuthService.verifyOtp(email, otp);
      res.status(HttpStatusCode.OK).json({ otp, email });
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async resentOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.query;
      if (!email || typeof email !== "string") {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "Email is required" });
        throw new Error("Email is required");
      }

      const result = await this._doctorAuthService.resentOtp(email);
      res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      console.error(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ msg: "refresh token not found" });
      }

      const result = await this._doctorAuthService.refreshToken(
        refreshToken
      );

      console.log("result from ctrl is ...", result);

      if (!result) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ msg: "Refresh token expired" });
      }

      const { accessToken } = result;

      console.log("result from ctrl is afrt destructr...", accessToken);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: parseInt(process.env.MAX_AGE || "604800000"),
      });

      res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      console.log(error);
      res 
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async getRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      res.status(HttpStatusCode.OK).json(refreshToken);
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }
}
