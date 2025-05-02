import { Types } from "mongoose";

export type TTransaction = {
  _id?: Types.ObjectId;
  transactionId: Types.ObjectId|string;
  purchase_id?: Types.ObjectId|string;
  wallet_id: Types.ObjectId;
  transaction_date?: Date;
  transaction_type?: string;
  amount?: number;
  description?: string;
};