

export interface notificationResponseDTO {
      _id: string;
      userId: string;
      date: Date;
      message: string;
      isRead: boolean;
      mention: string;
      link: string;
      type: string;
      createdAt: Date;
}