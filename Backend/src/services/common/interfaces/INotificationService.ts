import { UpdateResult } from "../../../dto/commonResponseDto";
import { notificationResponseDTO } from "../../../dto/notificationDto";

export default interface INotificationServices {

  readAllNotifications(id: string): Promise<UpdateResult>;
  getNewNotifications(
    id: string,
    newMsgs: boolean
  ): Promise<notificationResponseDTO[]>;
  getAllNotifications(id: string): Promise<notificationResponseDTO[]>;
}
