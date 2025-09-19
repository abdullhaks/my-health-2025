export default interface INotificationServices {
  createNotification(notification: any): Promise<any>;
  readAllNotifications(id: string): Promise<any>;
  getNewNotifications(
    id: string,
    newMsgs: boolean
  ): Promise<any>;
  getAllNotifications(id: string): Promise<any>;
}
