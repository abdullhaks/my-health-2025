import { Request, Response } from "express";
import IUserDashboardController from "../interfaces/IUserDashboardController";
import { inject, injectable } from "inversify";
import IUserDashboardService from "../../../services/user/interfaces/IUserDashboardService";
import { HttpStatusCode } from "../../../utils/enum";
import { MESSAGES } from "../../../utils/messages";

@injectable()
export default class UserDashboardController implements IUserDashboardController {
  constructor(
    @inject("IUserDashboardService")
    private _dashboardService: IUserDashboardService
  ) {}

  async getDashboardContent(req: Request, res: Response): Promise<void> {
    try {

    console.log("Received request for dashboard content with query:", req.query);
    
      const { days = "30", userId, latitude = 0, longitude = 0 } = req.query;
      const daysNumber = parseInt(days as string, 10);


      if (!userId) {
        throw new Error("credentials missed");
      }

      if (isNaN(daysNumber) || daysNumber < 1 || !userId) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Fetching Addvertisement failed" });
        return;
      }

      const response = await this._dashboardService.getDashboardContent(
        daysNumber,
        userId.toString(),
        parseFloat(latitude as string),
        parseFloat(longitude as string)
      );
      if (!response || (!response.blogs && !response.advertisements)) {
        res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ message: "No content found" });
        return;
      }

      res.status(HttpStatusCode.OK).json({
        message: "Dashboard content fetched successfully",
        data: response,
      });
    } catch (err) {
      console.error("Error fetching dashboard content:", err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: MESSAGES.server.serverError,
      });
    }
  }
}
