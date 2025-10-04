import { IConversation } from "../../../dto/conversationDTO";
import { ConversationResponseDTO,conversationResponseDTO_Temp } from "../../../dto/conversationDTO";

export default interface IConversationService {
  createOrGetConversation(userIds: string[]): Promise<conversationResponseDTO_Temp>;
  getUserConversations(userId: string, from: string): Promise<ConversationResponseDTO[]>;
}
