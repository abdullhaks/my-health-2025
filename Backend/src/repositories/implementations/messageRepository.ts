import { injectable, inject } from "inversify";
import { IMessageDocument, messageDocument } from "../../entities/messageEntities";
import {conversationDocument} from "../../entities/conversationEntities"
import BaseRepository from "./baseRepository";
import IMessageRepository from "../interfaces/IMessageRepository";
import {Model} from "mongoose";

@injectable()
export default class MessageRepository
  extends BaseRepository<IMessageDocument>
  implements IMessageRepository
{
  constructor(
    @inject("messageModel") private _messageModel: Model<messageDocument>,
    @inject("conversationModel") private _conversationModel: Model<conversationDocument>
  ) {
    super(_messageModel);
  }

  async createMessage(
    data: Partial<IMessageDocument>
  ): Promise<IMessageDocument> {
    if (!data.conversationId || !data.senderId || !data.content) {
      throw new Error("Conversation ID, sender ID, and content are required");
    }
    const message = await this._messageModel.create({
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
      status: data.status || "sent",
    });
    await this._conversationModel.findByIdAndUpdate(data.conversationId, {
      $set: { updatedAt: new Date(), lastMessage: data.content },
    });
    return message;
  }

  async getMessagesByConversation(
    conversationId: string
  ): Promise<IMessageDocument[]> {
    if (!conversationId) {
      throw new Error("Conversation ID is required");
    }
    return await this._messageModel
      .find({ conversationId })
      .sort({ timestamp: 1 });
  }

  async markMessagesAsSeen(
    conversationId: string,
    userId: string
  ): Promise<void> {
    if (!conversationId || !userId) {
      throw new Error("Conversation ID and user ID are required");
    }
    await this._messageModel.updateMany(
      { conversationId, senderId: { $ne: userId }, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId }, $set: { status: "read" } }
    );
  }
}
