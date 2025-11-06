import { Response, Request } from "express";
import IUserProfileController from "../interfaces/IUserProfileController";
import { inject, injectable } from "inversify";
import IUserProfileService from "../../../services/user/interfaces/IuserProfileServices";
import { HttpStatusCode } from "../../../utils/enum";
import { MESSAGES } from "../../../utils/messages";

injectable();

export default class UserProfileController implements IUserProfileController {
  constructor(
    @inject("IUserProfileService") private _profileService: IUserProfileService
  ) {}

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {

      const userData = req.body;
      const dobStr = new Date(userData.dob).toLocaleDateString();

      const [month, day, year] = dobStr.split("/");

      if(userData.dob.trim().length){
        userData.dob = `${year}-${month.padStart(2, "0")}-${day.padStart(
        2,
        "0"
      )}`;
      }else{
        userData.dob=""
      }
      

      const { refreshToken } = req.cookies;
      
            if (!refreshToken) {
              res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "Unauthorized" });
              return;
            }
      const result = await this._profileService.updateProfile(refreshToken, userData);

      res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async updateDp(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.cookies;
      
            if (!refreshToken) {
              res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "Unauthorized" });
              return;
            }
      const updatedFields = req.body;
      const uploadedImageKey = req.body.uploadedImageKey;


      const updatedUser = await this._profileService.updateUserDp(
        refreshToken,
        updatedFields,
        uploadedImageKey
      );

      res.status(HttpStatusCode.OK).json({ updatedUser });
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.cookies;
      
            if (!refreshToken) {
              res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "Unauthorized" });
              return;
            }
      const data = req.body.data;

      const response = await this._profileService.changePassword(refreshToken, data);

      if (!response) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "password changing has been failed" });
        return;
      }

      res.status(HttpStatusCode.OK).json({ msg: "password changed" });
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }
}
