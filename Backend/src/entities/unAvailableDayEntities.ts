import { Document, Types } from "mongoose";

export interface IUnAvailableDayDocument extends Document {
  _id: Types.ObjectId;
  doctorId: string;
  day: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface unAvailableDayDocument extends IUnAvailableDayDocument {}
