import { Types } from "mongoose";

export type TUserRegister = {
  name: string;
  email: string;
  password?: string;
  role: string;
  isBlocked:boolean;
  isAccepted:boolean;
};

export type TEmail = {
  email: string;
};

export type TUserLogin = {
  email: string;
  password: string;
  role: string;
};

export type TOtpVerify = {
  email: string;
  otp: number;
};

export type TUserModel = {
  name: string;
  email: string;
  password?: string | null | undefined;
  role: string;
  _id?: Types.ObjectId;
  isBlocked: boolean;
  isAccepted: boolean;
};

export type TTutorModel = {
  name: string;
  email: string;
  password?: string | null | undefined;
  role: string;
  _id?: Types.ObjectId;
  isBlocked: boolean;
  // isAccepted: boolean;
  specialization:string;
  verificationDocUrl:string;
  approvalStatus:string;
  phone:string;
  bio:string;
};


export type TUpdatePassword ={
  email:string;
  newPassword:string;
}

export type TPaginationOptions ={
  page: number;
  limit: number;
  search?: string;
  role?: string;
}

export type TPaginatedResult = {
  users: TTutorModel[];
  total: number;
  page: number;
  limit: number;
};