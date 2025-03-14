import { IOtpService } from "../../interfaces/serviceInterfaces/otpServiceInterface";
import { IVerifyOtpToRegisterUserService } from "../../interfaces/serviceInterfaces/user/verifyOtpToRegisterUserService";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constant";
import { TVerifyOtpToRegister } from "../../types/otp";
import { CustomError } from "../../util/CustomError";


export class VerifyOtpToRegisterUserService
  implements IVerifyOtpToRegisterUserService
{
  constructor(private otpService: IOtpService) {}

  async verifyOtpToRegister(data: TVerifyOtpToRegister): Promise<void> {
    const isOtpValid = await this.otpService.verifyOtp(data);
    if (!isOtpValid) {
      throw new CustomError(
        ERROR_MESSAGES.OTP_INVALID,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }
}