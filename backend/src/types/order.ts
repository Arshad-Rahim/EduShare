import { Schema } from "mongoose";

export type TOrderSave = {
  courseId: Schema.Types.ObjectId;
  orderId: string;
  amount: number;
  status: string;
};