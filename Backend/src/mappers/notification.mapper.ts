import { INotificationDocument } from "../entities/notificationEntities";
import { notificationResponseDTO } from "../dto/notificationDto";


export class NotificationMapper {
    static async toResponseDTO(notification: INotificationDocument): Promise<notificationResponseDTO> {

        return{
            _id: notification._id.toString(),
            userId: notification.userId,
            date: notification.date,
            message: notification.message,
            isRead: notification.isRead,
            mention: notification.mention,
            link: notification.link,
            type:  notification.type,
            createdAt: notification.createdAt,

        }
}

}