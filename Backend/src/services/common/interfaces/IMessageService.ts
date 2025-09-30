import { IMessage } from "../../../dto/messageDTO";
import { messageResponseDTO } from "../../../dto/messageDTO";

export default interface IMessageService {
  sendMessage(
    conversationId: string,
    senderId: string,
    text: string,
    type: string
  ): Promise<messageResponseDTO>;
  getMessages(conversationId: string): Promise<messageResponseDTO[]>;
  markMessagesAsSeen(conversationId: string, userId: string): Promise<void>;
}
