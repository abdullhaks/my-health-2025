import mongoose, { Schema, Document } from "mongoose";
import { IProgressPaymentDocument } from "../entities/progressingPayment";



const progressingPaymentSchema: Schema<IProgressPaymentDocument> = new Schema(
  {
    doctorId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    slotId:{
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 180,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

const progressPaymentModel = mongoose.model<IProgressPaymentDocument>("ProgressPayment", progressingPaymentSchema);

export default progressPaymentModel;
