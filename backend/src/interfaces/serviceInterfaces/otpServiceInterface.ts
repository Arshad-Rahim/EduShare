import { TOtp, TVerifyOtpToRegister } from "../../types/otp";


export interface IOtpService {
  otpGenerate(data: TOtp): Promise<void>;
  verifyOtp(data:TVerifyOtpToRegister):Promise<boolean>
}