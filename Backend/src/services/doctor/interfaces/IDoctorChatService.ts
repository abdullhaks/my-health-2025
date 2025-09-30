import { IConversation } from "../../../dto/conversationDTO";
import { IMessage } from "../../../dto/messageDTO";
import { messageResponseDTO } from "../../../dto/messageDTO";
import { conversationResponseDTO } from "../../../dto/conversationDTO";

export default interface IDoctorChatService {
  createOrGetConversation(userIds: string[]): Promise<conversationResponseDTO>;
  getUserConversations(userId: string,from: string): Promise<conversationResponseDTO[]>;
  sendMessage(
    conversationId: string,
    senderId: string,
    text: string
  ): Promise<messageResponseDTO>;
  getMessages(conversationId: string): Promise<messageResponseDTO[]>;
  markMessagesAsSeen(conversationId: string, userId: string): Promise<void>;
}
