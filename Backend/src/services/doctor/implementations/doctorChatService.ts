import { inject, injectable } from "inversify";
import IDoctorChatService from "../interfaces/IDoctorChatService";
import IConversationRepository from "../../../repositories/interfaces/IConversationRepository";
import { IConversation } from "../../../dto/conversationDTO";
import IMessageRepository from "../../../repositories/interfaces/IMessageRepository";
import { IMessage } from "../../../dto/messageDTO";
import { messageResponseDTO } from "../../../dto/messageDTO";
import { MessageMapper } from "../../../mappers/message.mapper";
import { conversationResponseDTO } from "../../../dto/conversationDTO";
import { ConversationMapper } from "../../../mappers/conversation.mapper";



@injectable()
export default class DoctorChatService implements IDoctorChatService {
  constructor(
    @inject("IConversationRepository")
    private _conversationRepository: IConversationRepository,
    @inject("IMessageRepository") private _messageRepository: IMessageRepository
  ) {}

 async createOrGetConversation(userIds: string[]): Promise<conversationResponseDTO> {
     if (!userIds || userIds.length !== 2) {
       throw new Error("Exactly two user IDs are required");
     }
 
     console.log("userIds.....", userIds);
     const existing =
       await this._conversationRepository.findConversationByMembers(userIds);
 
     console.log("existin conversation is ", existing);
     if (existing){
       const conversationDto = await ConversationMapper.toResponseDTO(existing)
 
       return conversationDto;
     } 
 
 
     const convs = await this._conversationRepository.createConversation(userIds);
     const consvDto = await ConversationMapper.toResponseDTO(convs);
 
     return consvDto
   }

    async getUserConversations(userId: string,from: string): Promise<conversationResponseDTO[]> {
      if (!userId) {
        throw new Error("User ID is required");
      }
      const convs =  await this._conversationRepository.getUserConversations(
        userId,
        from
      );
  
      const convDto = Promise.all (
        convs.map((item)=>ConversationMapper.toResponseDTO(item))
      );
  
      return convDto;
    }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<messageResponseDTO> {
    if (!conversationId || !senderId || !content) {
      throw new Error("Conversation ID, sender ID, and content are required");
    }

     const newMesage  = await this._messageRepository.createMessage({
      conversationId,
      senderId,
      content,
      readBy: [senderId],
      status: "sent",
    });

    const messageDto = MessageMapper.toResponseDTO(newMesage);

    return messageDto;


  }

  async getMessages(conversationId: string): Promise<messageResponseDTO[]> {
    if (!conversationId) {
      throw new Error("Conversation ID is required");
    }
    const messges =  await this._messageRepository.getMessagesByConversation(
      conversationId
    );

    const messageDtos =await Promise.all (
      messges.map(async (mssg)=>{
        return await MessageMapper.toResponseDTO(mssg)
      })
    );

    return messageDtos;

  }

  async markMessagesAsSeen(
    conversationId: string,
    userId: string
  ): Promise<void> {
    if (!conversationId || !userId) {
      throw new Error("Conversation ID and user ID are required");
    }
    await this._messageRepository.markMessagesAsSeen(conversationId, userId);
  }
}
