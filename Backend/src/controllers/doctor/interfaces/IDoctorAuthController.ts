import { Request, Response, NextFunction } from "express";

export default interface IDoctorAuthController {
  doctorLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
  doctorLogout(req: Request, res: Response): Promise<void>;
  refreshToken(req: Request, res: Response): Promise<void>;
  // getRefreshToken(
  //   req: Request,
  //   res: Response
  // ): Promise<void>;
  doctorSignup(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
  resentOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
}
