import { OtpController } from "../controller/otpController";
import { OtpRepository } from "../repository/otpRepository";
import { OtpService } from "../service/otp/otpService";

const otpRepository = new OtpRepository();
const otpService = new OtpService(otpRepository);

export const injectedOtpController = new OtpController(otpService);
