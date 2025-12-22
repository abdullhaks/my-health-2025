import { Document, Types } from "mongoose";

export interface IConversationDocument extends Document {
  _id: Types.ObjectId;
  members: string[];
  updatedAt: Date | string;
  lastMessage?: string;
}

export interface IConversation extends IConversationDocument {}


export interface ConversationMemberDTO {
  _id: string;
  name: string;
  avatar: string | null;
}

export interface ConversationResponseDTO {
  _id: string;
  members: ConversationMemberDTO[];
  lastMessage?: string;
  updatedAt?: Date | string,

}

export interface conversationResponseDTO_Temp {
  _id: string;
  members: string[];
  updatedAt: Date | string;
  lastMessage?: string;
}
