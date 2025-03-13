import { TVerifyOtpToRegister } from "../../types/otp";
import { TUserModel, TUserRegister } from "../../types/user";

export interface IUserService {
  createUser(data: TUserRegister): Promise<void>;
  verifyOtpToRegister(data:TVerifyOtpToRegister):Promise<TUserModel|null>
}