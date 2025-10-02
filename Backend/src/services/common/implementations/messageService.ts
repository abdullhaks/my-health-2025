// MessageService and MessageRepository remain mostly unchanged, but added note for potential _id handling if needed for optimistic UI
// Currently, backend generates _id, frontend uses temp and replaces by content match

import { inject, injectable } from "inversify";
import IMessageService from "../interfaces/IMessageService";
import IMessageRepository from "../../../repositories/interfaces/IMessageRepository";
import { messageResponseDTO } from "../../../dto/messageDTO";
import { MessageMapper } from "../../../mappers/message.mapper";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import IConversationRepository from "../../../repositories/interfaces/IConversationRepository";

@injectable()
export default class MessageService implements IMessageService {
  constructor(
    @inject("IMessageRepository") private _messageRepository: IMessageRepository,
    @inject("IConversationRepository") private _conversationRepository: IConversationRepository
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

    const msg = await this._messageRepository.createMessage({
      conversationId,
      senderId,
      content,
      type,
      readBy: [senderId],
      status: "sent",
    });

    const msgDto = await MessageMapper.toResponseDTO(msg);

    if (msgDto.type === "file") {
      msgDto.content = await getSignedImageURL(msgDto.content);
    }

    await this._conversationRepository.update(conversationId, {
      updatedAt: new Date(),
      lastMessage: content,
    });

    return msgDto;
  }

  async getMessages(conversationId: string): Promise<messageResponseDTO[]> {
    if (!conversationId) {
      throw new Error("Conversation ID is required");
    }
    const msgs = await this._messageRepository.getMessagesByConversation(
      conversationId
    );

    return await Promise.all(
      msgs.map(async (m) => {
        const dto = await MessageMapper.toResponseDTO(m);
        if (dto.type === "file") {
          dto.content = await getSignedImageURL(dto.content);
        }
        return dto;
      })
    );
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