import { inject, injectable } from "inversify";
import INotificationCtrl from "../interfaces/INotificationCtrl";
import { Request, Response } from "express";
import { HttpStatusCode } from "../../../utils/enum";
import INotificationServices from "../../../services/common/interfaces/INotificationService";
import { MESSAGES } from "../../../utils/messages";

@injectable()
export default class NotificationController implements INotificationCtrl {
  constructor(
    @inject("INotificationServices")
    private _notificationService: INotificationServices
  ) {}

  async createNotification(req: Request, res: Response): Promise<void> {}

  async readAllNotifications(req: Request, res: Response): Promise<void> {}

  async getNewNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { id, limit, notificationSet } = req.query;

      console.log("noti id is....", id, limit, notificationSet);
      if (!id || !limit || !notificationSet) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "fetching notification failed" });
        return;
      }

      const response = await this._notificationService.getNewNotifications(
        id.toString(),
        Number(limit),
        Number(notificationSet)
      );
      console.log("noti from ctrl....", response);
      res.status(HttpStatusCode.OK).json(response);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }

  async getAllNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.query;
      console.log("noti id is....", id);
      if (!id) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "fetching notification failed" });
        return;
      }

      const response = await this._notificationService.getAllNotifications(
        id.toString()
      );

      res.status(HttpStatusCode.OK).json(response);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.server.serverError });
    }
  }
}
