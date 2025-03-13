import { IOtpRepository } from "../interfaces/repositoryInterfaces/IOtpRepository";
import { otpModel } from "../models/otpModel";
import { TOtp, TVerifyOtpToRegister } from "../types/otp";

export class OtpRepository implements IOtpRepository {
  async otpGenerate(data: TOtp): Promise<void> {
    await otpModel.create(data);
  }
  async findByEmailAnOtp(data: TVerifyOtpToRegister): Promise<TOtp | null> {
    return await otpModel.findOne({ email: data.email, otp: data.otp });
  }

  async deleteOtp(email:string):Promise<void>{
    await otpModel.deleteOne({email})
  }
}
