import { conversationResponseDTO, IConversation } from "../dto/conversationDTO";


export class ConversationMapper {
   static async toResponseDTO(conversation: IConversation): Promise<conversationResponseDTO> {
    return {
      _id: conversation._id.toString(),
      members: conversation.members,
      updatedAt: conversation.updatedAt,
      lastMessage: conversation.lastMessage,
    };
  }
}