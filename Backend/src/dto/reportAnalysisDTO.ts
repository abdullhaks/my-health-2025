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
  analysisStatus: "pending" | "cancelled" | "submited";
  result: string;
}

export interface IReportAnalysis extends IReportAnalysisDocument {}

export interface reportAnalysisResponseDTO {

  _id: string;
  doctorId: string;
  userId: string;
  concerns: string;
  files: Array<string>;
  doctorName: string;
  doctorCategory: string;
  createdAt: Date;
  fee: number;
  analysisStatus: "pending" | "cancelled" | "submited";
  result: string;

}

export interface reportAnalysisRequestDTO {

}