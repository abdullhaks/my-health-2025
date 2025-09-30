import { messageResponseDTO } from "../dto/messageDTO";
import { IMessage } from "../dto/messageDTO";


export class MessageMapper {
   static async toResponseDTO(message: IMessage):Promise<messageResponseDTO> {
    return {
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        type: message.type,
        timestamp: message.timestamp,
        readBy: message.readBy,
        status: message.status,
    };
  }
}