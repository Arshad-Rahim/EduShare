import { TOtp, TVerifyOtpToRegister } from "../../types/otp";

export interface IOtpRepository {
  otpGenerate(data: TOtp): Promise<void>;
  findByEmailAnOtp(data: TVerifyOtpToRegister): Promise<TOtp | null>;
  deleteOtp(email: string): Promise<void>;
}
