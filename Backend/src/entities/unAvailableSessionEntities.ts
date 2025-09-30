import { Document, Types } from "mongoose";

export interface IUnAvailableSessionDocument extends Document {
  _id: Types.ObjectId;
  doctorId: string;
  sessionId: string;
  day: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface unAvailableSessionDocument extends IUnAvailableSessionDocument {}
