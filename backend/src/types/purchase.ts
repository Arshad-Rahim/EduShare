import { Types } from "mongoose";

export type TPurchase = {
  _id: Types.ObjectId ;
  userId: Types.ObjectId ;
  purchase: [{
    courseId: Types.ObjectId ;
    orderId: string;
    amount: number;
    status: string;
    createdAt: Date;
  }];
};
