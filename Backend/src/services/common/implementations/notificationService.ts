import { inject, injectable } from "inversify";
import INotificationServices from "../interfaces/INotificationService";
import INotificationRepository from "../../../repositories/interfaces/INotificationRepository";
import { notificationResponseDTO } from "../../../dto/notificationDto";
import { NotificationMapper } from "../../../mappers/notification.mapper";
import { UpdateResult } from "../../../dto/commonResponseDto";

@injectable()
export default class NotificationService implements INotificationServices {
  constructor(
    @inject("INotificationRepository")
    private _notificationRepository: INotificationRepository
  ) {}



  async getAllNotifications(id: string): Promise<notificationResponseDTO[]> {
    console.log("noti id is service......", id);

    const response = await this._notificationRepository.findAll({ userId: id });

    const notifiecationDto = await Promise.all(
      response.map(async(noti)=> await  NotificationMapper.toResponseDTO(noti))
    )
    
 

    return notifiecationDto;
  }

  async getNewNotifications(
    id: string,
    newMsgs: boolean
  ): Promise<notificationResponseDTO[]> {

    console.log("noti id is service......", id, newMsgs);
    
    if(newMsgs){

      const response = await this._notificationRepository.findAll({ userId: id, isRead: false },{sort: { createdAt: -1 }});
      
      console.log("new noti is service......response", response);
      if(!response.length){
        const nwResp = await this._notificationRepository.findAll({ userId: id },{sort: { createdAt: -1 },limit:10});
      console.log("new noti is service......nwResp", nwResp);

      const notifiecationDto = await Promise.all(
      nwResp.map(async(noti)=> await  NotificationMapper.toResponseDTO(noti)) )
        
        return notifiecationDto;
      };


      const notifiecationDto = await Promise.all(
      response.map(async(noti)=> await  NotificationMapper.toResponseDTO(noti)) )
      
      return notifiecationDto
    }else{
      const response = await this._notificationRepository.findAll({ userId: id },{sort: { createdAt: -1 }});
      console.log("new noti is service......response2", response);

      const notifiecationDto = await Promise.all(
      response.map(async(noti)=> await  NotificationMapper.toResponseDTO(noti)) )
      
      return notifiecationDto;

    }

  }

  async readAllNotifications(id: string): Promise<UpdateResult> {

    const response = await this._notificationRepository.updateMany(
      { userId: id, isRead: false },
      { $set: { isRead: true } }
    );
    return response;
  }
}
