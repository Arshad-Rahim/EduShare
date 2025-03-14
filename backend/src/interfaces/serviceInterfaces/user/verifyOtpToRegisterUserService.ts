import { TVerifyOtpToRegister } from "../../../types/otp";



export interface IVerifyOtpToRegisterUserService {
  verifyOtpToRegister(data: TVerifyOtpToRegister): Promise<void>;
}