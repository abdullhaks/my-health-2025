import { Document, Types } from "mongoose";

export interface IAdvertisementDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  author: string;
  authorId: string;
  location: object;
  tags: Array<string>;
  videoUrl: string;
  pack: string;
  fee: number;
  views: number;
  clicks: number;
  expDate: Date;
  createdAt: Date;
}

export interface IAdvertisement extends IAdvertisementDocument {}


export interface advertisementResponseDTO {
  _id: string;
  title: string;
  author: string;
  authorId: string;
  location: object;
  tags: Array<string>;
  videoUrl: string;
  pack: string;
  fee: number;
  views: number;
  clicks: number;
  expDate: Date;
  createdAt: Date;
}

export interface advertisementRequestDTO {
title:string;
videoUrl:string;
location:object;
author:string;
authorId:string;
tags:Array<string>;
}