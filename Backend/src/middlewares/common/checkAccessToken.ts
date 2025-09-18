import { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyAccessToken } from "../../utils/jwt";
import userModel from "../../models/user";
import { HttpStatusCode } from "../../utils/enum";

export function verifyAccessTokenMidleware(
  role: "user" | "admin" | "doctor"
): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (req.path.includes("/refreshToken")) return next();

    let token;
    if (role === "user") {
      const { accessToken } = req.cookies;

      // console.log("token is..... ",userAccessToken);

      token = accessToken;
      if (!accessToken) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ msg: "Access token missing" });

        return;
      }
    }

    if (role === "admin") {
      const { accessToken } = req.cookies;

      // console.log("token is..... ",accessToken);

      token = accessToken;
      if (!accessToken) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ msg: "Access token missing" });
        return;
      }
    }

    if (role === "doctor") {
      const { accessToken } = req.cookies;

      // console.log("token is..... ",accessToken);

      token = accessToken;
      if (!accessToken) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ msg: "Access token missing" });
        return;
      }
    }

    try {
      const decoded = verifyAccessToken(token);

      // console.log("decoded is..... ",decoded);

      if (!decoded) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ msg: "Access token expired or invalid" });
        return;
      }
      if (decoded.role !== role) {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .json({ msg: "Forbidden: Role mismatch" });
        return;
      }

      if (role === "user") {
        const user = await userModel.findById(decoded.id).select("isBlocked");
        if (!user) {
          res
            .status(HttpStatusCode.NOT_FOUND)
            .json({ success: false, error: { message: "User not found" } });
          return;
        }

        if (user.isBlocked) {
          res
            .status(HttpStatusCode.FORBIDDEN)
            .json({
              success: false,
              error: { message: "User is blocked. Please contact support." },
            });
          return;
        }
      }

      next();
    } catch (err) {
      console.error("Access token error:", err);
      res
        .status(HttpStatusCode.FORBIDDEN)
        .json({ msg: "Forbidden: Role mismatch" });
      return;
    }
  };
}

export { verifyAccessToken };
