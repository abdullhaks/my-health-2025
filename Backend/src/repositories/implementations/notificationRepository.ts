import { inject, injectable } from "inversify";
import INotificationRepository from "../interfaces/INotificationRepository";
import BaseRepository from "./baseRepository";
import { INotificationDocument, notificationDocument } from "../../entities/notificationEntities";
import { FilterQuery, Model } from "mongoose";

@injectable()
export default class NotificationRepository
  extends BaseRepository<INotificationDocument>
  implements INotificationRepository
{
  constructor(@inject("notificationModel") private _notificationModel: Model<notificationDocument>) {
    super(_notificationModel);
  }

  async getNewNotifications(
    id: string,
    limit: number,
    notificationSet: number
  ): Promise<{
        notifications: INotificationDocument[];
        totalPages: number;
      }> {
    try {
      const query: FilterQuery<INotificationDocument> = { userId: id };

      const skip = (notificationSet - 1) * limit;

      const notifications = await this._notificationModel
        .find(query)
        .skip(skip)
        .limit(limit);

      const total = await this._notificationModel.countDocuments({
        userId: id,
        isRead: false,
      });
      return {
        notifications,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch notifications");
    }
  }
}
