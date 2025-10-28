import { Request, Response } from "express";
import IAdminAuthController from "../interfaces/IAdminAuthController";
import { inject, injectable } from "inversify";
import IAdminAuthService from "../../../services/admin/interfaces/IAdminAuthService";
import { HttpStatusCode } from "../../../utils/enum";
import { MESSAGES } from "../../../utils/messages";
import { HttpException } from "../../../utils/http.exception";

@injectable()
export default class AdminAuthController implements IAdminAuthController {
  constructor(
    @inject("IAdminAuthService") private _adminAuthService: IAdminAuthService
  ) {}

  async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      const { email, password } = req.body;


      const result = await this._adminAuthService.login({ email, password });


      if (!result) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ msg: "Envalid credentials" });
        return;
      }

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: parseInt(process.env.MAX_AGE || "604800000"),
      });

      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: parseInt(process.env.MAX_AGE || "604800000"),
      });

      res
        .status(HttpStatusCode.OK)
        .json({ message: result.message, admin: result.admin });
    } catch (error: any) {
    
    
        if (error instanceof HttpException) {
    
          res.status(error.status).json({ message: error.message, code: error.code });
          return;
        }
    
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
           .json({ message: MESSAGES.server.serverError });
      }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const email = req.query.email;

      if (!email || typeof email !== "string") {
        //    res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "Email must be provided in query" });
        throw new Error("Email missing");
      }
      const result = await this._adminAuthService.forgotPassword(email);
      res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async getRecoveryPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const resp = this._adminAuthService.forgotPassword(email);

      res.status(HttpStatusCode.OK).json(resp);
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async verifyRecoveryPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, recoveryCode } = req.body;

      if (!email || !recoveryCode) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "Email and recovery code are required" });
      }

      const isValid = await this._adminAuthService.verifyRecoveryPassword(
        email,
        recoveryCode
      );

      if (!isValid) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "Invalid recovery code" });
      }

      res
        .status(HttpStatusCode.OK)
        .json({ msg: "Recovery code verified successfully" });
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      const { password, confirmPassword } = req.body;

      res.status(HttpStatusCode.OK).json({ email, password, confirmPassword });
    } catch (error) {
      console.log(error);
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
        return;
      }
      const result = await this._adminAuthService.refreshToken(refreshToken);
      if (!result) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ msg: "Refresh token expired" });
        return;
      }

      const { accessToken } = result;


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
  };



    async adminLogout(req: Request, res: Response): Promise<void> {
      try {
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
          .json({ message:"logout successfully"});
      } catch (error) {
        console.log(error);
        res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
      }
    }
}
