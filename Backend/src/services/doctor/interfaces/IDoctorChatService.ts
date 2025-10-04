import { IConversation } from "../../../dto/conversationDTO";
import { IMessage } from "../../../dto/messageDTO";
import { messageResponseDTO } from "../../../dto/messageDTO";
import { ConversationResponseDTO,conversationResponseDTO_Temp } from "../../../dto/conversationDTO";
import { ConversationMapper,Conversations_Mapper } from "../../../mappers/conversation.mapper";

export default interface IDoctorChatService {
  createOrGetConversation(userIds: string[]): Promise<conversationResponseDTO_Temp>;
  getUserConversations(userId: string,from: string): Promise<ConversationResponseDTO[]>;
  sendMessage(
    conversationId: string,
    senderId: string,
    text: string
  ): Promise<messageResponseDTO>;
  getMessages(conversationId: string): Promise<messageResponseDTO[]>;
  markMessagesAsSeen(conversationId: string, userId: string): Promise<void>;
}
