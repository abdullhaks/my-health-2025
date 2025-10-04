import { ConversationResponseDTO, conversationResponseDTO_Temp, IConversation } from "../dto/conversationDTO";


export class ConversationMapper {
   static async toResponseDTO(conversation: IConversation): Promise<conversationResponseDTO_Temp> {
    return {
      _id: conversation._id.toString(),
      members: conversation.members,
      updatedAt: conversation.updatedAt,
      lastMessage: conversation.lastMessage,
    };
  }
};


export class Conversations_Mapper {
   static async toResponseDTO(conversation: ConversationResponseDTO): Promise<ConversationResponseDTO> {
    return {
      _id: conversation._id.toString(),
      members: conversation.members,
      lastMessage: conversation.lastMessage,
    };
  }
}