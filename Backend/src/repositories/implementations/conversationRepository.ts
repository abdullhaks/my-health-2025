

import { injectable, inject } from "inversify";
import { IConversationDocument, conversationDocument } from "../../entities/conversationEntities";
import BaseRepository from "./baseRepository";
import IConversationRepository from "../interfaces/IConversationRepository";
import { getSignedImageURL } from "../../middlewares/common/uploadS3";
import { Model } from "mongoose";
import mongoose from "mongoose";
import { ConversationResponseDTO } from "../../dto/conversationDTO";


@injectable()
export default class ConversationRepository
  extends BaseRepository<IConversationDocument>
  implements IConversationRepository
{
  constructor(@inject("conversationModel") private _conversationModel: Model<conversationDocument>) {
    super(_conversationModel);
  }

  async createConversation(members: string[]): Promise<IConversationDocument> {
    if (!members || members.length !== 2) {
      throw new Error("Exactly two members are required");
    }
    return await this._conversationModel.create({
      members,
      updatedAt: new Date(),
    });
  }

  async findConversationByMembers(
    members: string[]
  ): Promise<IConversationDocument | null> {
    if (!members || members.length !== 2) {
      throw new Error("Exactly two members are required");
    }
    return await this._conversationModel.findOne({
      members: { $all: members, $size: members.length },
    });
  }

  async getUserConversations(userId: string, from: string): Promise<ConversationResponseDTO[]> {
        console.log("hereree 4")

    if (!userId) {
        console.log("hereree 5")

      throw new Error("User ID is required");
    }
    const conversations = await this._conversationModel
      .find({ members: userId })
      .sort({ updatedAt: -1 });


      console.log("conversations......",conversations)

    const OtherModel = mongoose.model(from); // 'User' or 'Doctor'
      console.log("OtherModel......",OtherModel)


    return await Promise.all(
      conversations.map(async (conv) => {
        const otherMemberId = conv.members.find((m: string) => m !== userId);
        const otherMember = await OtherModel.findById(otherMemberId, '_id fullName profile');
        
        console.log("other memebr.....",otherMember);

        const memberDto = otherMember ? {
          _id: otherMember._id.toString(),
          name: otherMember.fullName,
          avatar: otherMember.profile?await getSignedImageURL(otherMember.profile):"",
        } : null;

        console.log("memberDto .....",memberDto);

        return {
          _id: conv._id.toString(),
          members: memberDto ? [memberDto] : [],
          lastMessage: conv.lastMessage,
        };
      })
    );
  }
}