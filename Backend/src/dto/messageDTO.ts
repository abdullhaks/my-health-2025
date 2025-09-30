import { Document, Types } from "mongoose";

export interface IMessageDocument extends Document {
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  timestamp: string;
  readBy: [string];
  status: string;
}

export interface IMessage extends IMessageDocument {}


export interface messageResponseDTO {

  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  timestamp: string;
  readBy: [string];
  status: string;

}

export interface messageRequestDTO {

}