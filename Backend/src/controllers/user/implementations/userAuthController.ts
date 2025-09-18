import { NextFunction, Request, Response } from "express";
import IUserAuthCtrl from "../interfaces/IUserAuthCtrl";
import { inject, injectable } from "inversify";
import IUserAuthService from "../../../services/user/interfaces/IUserAuthServices";
import { HttpStatusCode } from "../../../utils/enum";

//..................temp
import axios from "axios";
import User from "../../../models/user";
import { generateAccessToken, generateRefreshToken } from "../../../utils/jwt";
import { UserLoginRequestDTO } from "../../../dto/userDTO";
import { MESSAGES } from "../../../utils/messages";
import { generateRandomPassword } from "../../../utils/helpers";

@injectable()
export default class UserAuthController implements IUserAuthCtrl {
  constructor(
    @inject("IUserAuthService") private _userService: IUserAuthService
  ) {}

  async userLogin(req: Request, res: Response): Promise<void> {
    try {
      const loginDTO: UserLoginRequestDTO = req.body;

      console.log("loginDTO...........", loginDTO);
      const result = await this._userService.login(loginDTO);

      console.log("result is ", result);

      if (!result) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "Envalid credentials" });
        return;
      }

      res.cookie("userRefreshToken", result.refreshToken, {
        httpOnly: true,
        sameSite: "none", // allow cross-site
        secure: true, // only over HTTPS
        maxAge: parseInt(process.env.MAX_AGE || "604800000"),
      });

      res.cookie("userAccessToken", result.accessToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: parseInt(process.env.MAX_AGE || "604800000"),
      });

      res
        .status(HttpStatusCode.OK)
        .json({ message: result.message, user: result.user });
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const { userEmail } = req.cookies;

      console.log("user email from auth ctrl....", userEmail);
      if (!userEmail) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "Unauthorized" });
        return;
      }

      const result = await this._userService.getMe(userEmail);
      res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async userLogout(req: Request, res: Response): Promise<void> {
    try {
      console.log("log out ............ ctrl....");
      res.clearCookie("userRefreshToken", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      res.clearCookie("userAccessToken", {
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

  async userSignup(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { fullName, email, password, confirmPassword } = req.body;

      const userDetails = { fullName, email, password, confirmPassword };

      console.log("user details is ", userDetails);

      const user = await this._userService.signup(userDetails);

      console.log("user  is ", user);

      res.status(HttpStatusCode.CREATED).json(user);
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

      const otpRecord = await this._userService.verifyOtp(email, otp);
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
        return;
      }

      const result = await this._userService.resentOtp(email);
      res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      console.error(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const email = req.query.email;

      if (typeof email !== "string") {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "Email must be provided " });
        return;
      }
      const result = await this._userService.forgotPassword(email);
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
      const resp = this._userService.forgotPassword(email);

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
        return;
      }

      const isValid = await this._userService.verifyRecoveryPassword(
        email,
        recoveryCode
      );

      if (!isValid) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "Invalid recovery code" });
        return;
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
      console.log("body is from reser password ", req.body);

      const { email } = req.params;
      const { newPassword, confirmPassword } = req.body.formData;

      if (newPassword != confirmPassword) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "invalid inputs" });
        return;
      }
      const response = this._userService.resetPassword(email, newPassword);

      if (!response) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "user not found" });
        return;
      }

      res.status(HttpStatusCode.OK).json({ msg: "password updated" });
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { userRefreshToken } = req.cookies;

      if (!userRefreshToken) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ msg: "refresh token not found" });
        return;
      }

      const result = await this._userService.refreshToken(userRefreshToken);

      console.log("result from ctrl is ...", result);

      if (!result) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ msg: "Refresh token expired" });
        return;
      }

      const { accessToken } = result;

      console.log("result from ctrl is afrt destructr...", accessToken);

      res.cookie("userAccessToken", accessToken, {
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

  async googleLoginRedirect(req: Request, res: Response): Promise<void> {
    let serverUrl = process.env.SERVER_URL || "http://localhost:3000";

    try {
      const redirectURI = `${serverUrl}/api/user/google/callback`;
      const clientId = process.env.GOOGLE_CLIENT_ID!;
      const scope = encodeURIComponent("profile email");
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectURI}&response_type=code&scope=${scope}`;
      res.redirect(url);
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async googleCallback(req: Request, res: Response): Promise<void> {
    const code = req.query.code as string;
    let serverUrl = process.env.SERVER_URL || "http://localhost:3000";
    let clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    try {
      // Exchange code for tokens
      const tokenRes = await axios.post(
        "https://oauth2.googleapis.com/token",
        {
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: `${serverUrl}/api/user/google/callback`,
          grant_type: "authorization_code",
        },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const { access_token, id_token } = tokenRes.data;

      // Get user info from Google
      const userRes = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      console.log("user res is ......", userRes.data);
      const { email, name, picture } = userRes.data;

      // Find or create user
      let user = await User.findOne({ email });
      if (!user) {
        const tempPass = generateRandomPassword(10);
        user = await User.create({
          email,
          fullName:name,
          isVerified: true,
          password: tempPass, 
        });
        
      }

      console.log("User is ............", user);

      // Issue your tokens
      const myAccessToken = generateAccessToken({
        id: user._id.toString(),
        role: "user",
      });
      const myRefreshToken = generateRefreshToken({
        id: user._id.toString(),
        role: "user",
      });

      res.cookie("userEmail", user.email, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: parseInt(process.env.MAX_AGE || "604800000"),
      });

      res.cookie("userRefreshToken", myRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: parseInt(process.env.MAX_AGE || "604800000"),
      });

      res.cookie("userAccessToken", myAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: parseInt(process.env.MAX_AGE || "604800000"),
      });

      // Redirect to frontend dashboard
      res.redirect(`${clientUrl}/user/google-success`);
    } catch (err) {
      console.error("Google login error:", err);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }
}
