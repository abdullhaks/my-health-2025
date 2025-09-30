import { Document, Types } from "mongoose";

export interface ISessionDocument extends Document {
  _id: Types.ObjectId;
  doctorId: Types.ObjectId | string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  duration: number;
  fee: number;
  rRule: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession extends ISessionDocument {}

export interface sessionResponseDTO {

  _id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  duration: number;
  fee: number;
  rRule: string;
  createdAt: Date;
  updatedAt: Date;

};

export interface SessionRequestDTO {

}
