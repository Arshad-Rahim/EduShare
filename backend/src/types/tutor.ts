import { Types } from "mongoose";

export type TUpdateTutorProfileBody = {
  userId: string;
  name: string;
  phone: string;
  specialization: string;
  bio: string;
};

export type TTutorModel = {
  name: string;
  email: string;
  password?: string | null | undefined;
  role: string;
  _id?: Types.ObjectId;
  isBlocked: boolean;
  isAccepted?: boolean;
  specialization: string;
  verificationDocUrl: string;
  approvalStatus: string;
  phone: string;
  bio: string;
  rejectionReason?: string;
};

export type TPaginatedResult = {
  users: TTutorModel[];
  total: number;
  page: number;
  limit: number;
};