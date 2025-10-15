// Rebuilt ConversationService (minor adjustments for consistency)

import { inject, injectable } from "inversify";
import IConversationService from "../interfaces/IConversationService";
import IConversationRepository from "../../../repositories/interfaces/IConversationRepository";
import { ConversationResponseDTO,conversationResponseDTO_Temp } from "../../../dto/conversationDTO";
import { ConversationMapper,Conversations_Mapper } from "../../../mappers/conversation.mapper";

@injectable()
export default class ConversationService implements IConversationService {
  constructor(
    @inject("IConversationRepository")
    private _conversationRepository: IConversationRepository
  ) {}

  async createOrGetConversation(userIds: string[]): Promise<conversationResponseDTO_Temp> {
    if (!userIds || userIds.length !== 2) {
      throw new Error("Exactly two user IDs are required");
    }

    const existing =
      await this._conversationRepository.findConversationByMembers(userIds);

    if (existing) {
      return await ConversationMapper.toResponseDTO(existing);
    }

    const conv = await this._conversationRepository.createConversation(userIds);
    return await ConversationMapper.toResponseDTO(conv);
  }

  async getUserConversations(userId: string, from: string): Promise<ConversationResponseDTO[]> {

    if (!userId) {

      throw new Error("User ID is required");
    }
    const convs = await this._conversationRepository.getUserConversations(
      userId,
      from
    );

    return await Promise.all(
      convs.map((item) => Conversations_Mapper.toResponseDTO(item))
    );
  }
}