import { Types } from "mongoose"

export type TWallet = {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number;
  createdAt?: Date;
  updatedAt?: Date;
};