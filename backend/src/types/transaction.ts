import { Types } from "mongoose";

export type TTransaction = {
  _id?: Types.ObjectId;
  transactionId: Types.ObjectId|String;
  purchase_id: Types.ObjectId;
  wallet_id: Types.ObjectId;
  transaction_date?: Date;
  transaction_type?: String;
  amount?: Number;
  description?: String;
};