import { inject, injectable } from "inversify";
import INotificationServices from "../interfaces/INotificationService";
import INotificationRepository from "../../../repositories/interfaces/INotificationRepository";

@injectable()
export default class NotificationService implements INotificationServices {
  constructor(
    @inject("INotificationRepository")
    private _notificationRepository: INotificationRepository
  ) {}

  async createNotification(notification: any): Promise<any> {}

  async getAllNotifications(id: string): Promise<any> {
    console.log("noti id is service......", id);

    const response = await this._notificationRepository.findAll({ userId: id });
    return response;
  }

  async getNewNotifications(
    id: string,
    newMsgs: boolean
  ): Promise<any> {

    console.log("noti id is service......", id, newMsgs);
    
    if(newMsgs){

      const response = await this._notificationRepository.findAll({ userId: id, isRead: false },{sort: { createdAt: -1 }});
      
      console.log("new noti is service......response", response);
      if(!response.length){
        const nwResp = await this._notificationRepository.findAll({ userId: id },{sort: { createdAt: -1 },limit:10});
      console.log("new noti is service......nwResp", nwResp);
        
        return nwResp;
      }
      return response
    }else{
      const response = await this._notificationRepository.findAll({ userId: id },{sort: { createdAt: -1 }});
      console.log("new noti is service......response2", response);
      
      return response;

    }

  }

  async readAllNotifications(id: string): Promise<any> {

    const response = await this._notificationRepository.updateMany(
      { userId: id, isRead: false },
      { $set: { isRead: true } }
    );
    return response;
  }
}
