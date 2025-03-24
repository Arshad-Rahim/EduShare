import { Types } from "mongoose"


export type TNotification ={
    userId:string | Types.ObjectId,
    type:string,
    message:string,
    reason:string,
    read:boolean,
    createdAt:Date
}