import { Document, Types } from "mongoose";

export interface IReportAnalysisDocument extends Document {
  _id: Types.ObjectId;
  doctorId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  concerns: string;
  files: Array<string>;
  doctorName: string;
  doctorCategory: string;
  createdAt: Date;
  fee: number;
  transactionId?: string;
  analysisStatus: "pending" | "cancelled" | "submited";
  result: string;
  updatedAt: Date;
}
export interface reportAnalysisDocument extends IReportAnalysisDocument {}
