import { IConversation } from "../../../dto/conversationDTO";
import { conversationResponseDTO } from "../../../dto/conversationDTO";

export default interface IConversationService {
  createOrGetConversation(userIds: string[]): Promise<conversationResponseDTO>;
  getUserConversations(userId: string, from: string): Promise<conversationResponseDTO[]>;
}
