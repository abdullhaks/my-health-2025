import { Document, Types } from "mongoose";

export interface IConversationDocument extends Document {
  _id: Types.ObjectId;
  members: string[];
  updatedAt: Date;
  lastMessage?: string;
}

export interface IConversation extends IConversationDocument {}


export interface conversationResponseDTO {
  _id: string;
  members: string[];
  updatedAt: Date;
  lastMessage?: string;
}

export interface conversationResponseDTO {

}