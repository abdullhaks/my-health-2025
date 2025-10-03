import { Document, Types } from "mongoose";

export interface IProgressPaymentDocument extends Document {
  _id: Types.ObjectId;
  doctorId: string;
  userId: string;
  slotId: string;
  createdAt: Date;
}
export interface progressPaymentDocument extends IProgressPaymentDocument {}
