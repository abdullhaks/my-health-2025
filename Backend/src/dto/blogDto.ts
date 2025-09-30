import { Document, Types } from "mongoose";

export interface IBlogDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  thumbnail: string;
  content: string;
  author: string;
  authorId: string;
  img1: string;
  img2: string;
  img3: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlog extends IBlogDocument {};


export interface blogResponseDTO {

  _id: string;
  title: string;
  thumbnail: string;
  content: string;
  author: string;
  authorId: string;
  img1: string;
  img2: string;
  img3: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  
};

export interface blogRequestDTO {

}
