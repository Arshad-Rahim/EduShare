import { TEmail, TUserModel } from "../../../types/user";


export interface IVerifyEmailUserService{
    verifyEmail(email:string):Promise<TUserModel |null>
}