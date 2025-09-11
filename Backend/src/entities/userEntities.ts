import { Document,Types } from "mongoose";



export interface ILocation {
    type: "Point";
    coordinates:[number,number];
    text:string;
}
export interface IUserDocument extends Document{

    _id:Types.ObjectId;
    fullName:string;
    email:string;
    password:string;
    profile:string;
    phone:string;
    location:ILocation;
    gender:string;
    dob:string;
    isBlocked:boolean;
    isVerified:boolean;
    bmi:string;
    medicalTags:string;
    latestHealthSummary:string;
    walletBalance:number;
    tags:string[];
    createdAt:Date;
    updatedAt:Date

}