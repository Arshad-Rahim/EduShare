import { TUpdatePassword } from "../../../types/user";


export interface IResetPasswordService{
    resetPassword(data:TUpdatePassword):Promise<boolean>;
}