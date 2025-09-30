import { inject, injectable } from "inversify";
import IMessageService from "../interfaces/IMessageService";
import IMessageRepository from "../../../repositories/interfaces/IMessageRepository";
import { IMessage } from "../../../dto/messageDTO";
import IConversationRepository from "../../../repositories/interfaces/IConversationRepository";
import { messageResponseDTO } from "../../../dto/messageDTO";
import { MessageMapper } from "../../../mappers/message.mapper";

@injectable()
export default class MessageService implements IMessageService {
  constructor(
    @inject("IMessageRepository") private _messageRepository: IMessageRepository,
    @inject("IConversationRepository") private _conversationRepostory: IConversationRepository
  ) {}

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: string = "text"
  ): Promise<messageResponseDTO> {
    if (!conversationId || !senderId || !content || !type) {
      throw new Error("Conversation ID, sender ID, and content are required");
    }

    const messg = await this._messageRepository.createMessage({
      conversationId,
      senderId,
      content,
      type,
      readBy: [senderId],
      status: "sent",
    });

    const messgDto = await MessageMapper.toResponseDTO(messg);

    const updateconv = await this._conversationRepostory.update(conversationId,{updatedAt: new Date(), lastMessage: content});

    return messgDto;
  }

  async getMessages(conversationId: string): Promise<messageResponseDTO[]> {
    if (!conversationId) {
      throw new Error("Conversation ID is required");
    }
    const messges =  await this._messageRepository.getMessagesByConversation(
      conversationId
    );

    const messgesDto = await Promise.all(
      messges.map(async (m) => await MessageMapper.toResponseDTO(m))
    )

    return messgesDto;

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
