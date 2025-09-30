import { inject, injectable } from "inversify";
import IConversationService from "../interfaces/IConversationService";
import IConversationRepository from "../../../repositories/interfaces/IConversationRepository";
import { IConversation } from "../../../dto/conversationDTO";
import { conversationResponseDTO } from "../../../dto/conversationDTO";
import { ConversationMapper } from "../../../mappers/conversation.mapper";


@injectable()
export default class ConversationService implements IConversationService {
  constructor(
    @inject("IConversationRepository")
    private _conversationRepository: IConversationRepository
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
}
