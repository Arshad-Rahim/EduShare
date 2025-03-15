import { IOtpService } from "../../interfaces/serviceInterfaces/otpServiceInterface";
import { TOtp, TVerifyOtpToRegister } from "../../types/otp";
import { transporter } from "../../mail/sendMail";
import { generateOtp } from "../../util/generateOtp";
import { config } from "../../shared/mailTemplate";
import { IOtpRepository } from "../../interfaces/repositoryInterfaces/IOtpRepository";
import { CustomError } from "../../util/CustomError";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constant";

export class OtpService implements IOtpService {
  constructor(private otpRepository: IOtpRepository) {}
  async otpGenerate(data: Omit<TOtp, "otp">): Promise<void> {
    const otp = generateOtp();
    console.log("OTP sended:", otp);
    const newOtp = {
      email: data.email,
      otp: otp,
      expiredAt: new Date(Date.now() + 60 * 1000),
    };

    await this.otpRepository.otpGenerate(newOtp);

    const mailOptions = {
      from: "edushare.org@gmail.com",
      to: data.email,
      subject: "Sending Email using Nodemailer",

      html: config.otpTemplate(otp),
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      // console.log("Email sent :", info.response);
    } catch (error) {
      console.error("Error sending email :", error);
      throw error;
    }
  }

  async verifyOtp(data: TVerifyOtpToRegister): Promise<boolean> {
    const otpEntry = await this.otpRepository.findByEmailAnOtp(data);

    if (!otpEntry) {
      throw new CustomError(
        ERROR_MESSAGES.OTP_INVALID,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!otpEntry.expiredAt || otpEntry.expiredAt < new Date()) {
      throw new CustomError(ERROR_MESSAGES.OTP_EXPIRED, HTTP_STATUS.GONE);
    }
    await this.otpRepository.deleteOtp(data.email);
    return true;
  }
}
