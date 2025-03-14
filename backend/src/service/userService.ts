import { IUserRepository } from "../interfaces/repositoryInterfaces/IUserRepository";
import { IOtpService } from "../interfaces/serviceInterfaces/otpServiceInterface";
import { IUserService } from "../interfaces/serviceInterfaces/userServiceInterface";
import { ERROR_MESSAGES, HTTP_STATUS } from "../shared/constant";
import { TOtp, TVerifyOtpToRegister } from "../types/otp";
import { TUserLogin, TUserModel, TUserRegister } from "../types/user";
import { comparePassword, hashPassword } from "../util/bcrypt";
import { CustomError } from "../util/CustomError";

export class UserService implements IUserService {
  constructor(
    private userRepository: IUserRepository,
    private otpService: IOtpService
  ) {}

  async createUser(data: TUserRegister): Promise<void> {
    const alredyExisting = await this.userRepository.findByEmail(data);
    if (alredyExisting) {
      throw new CustomError(ERROR_MESSAGES.EMAIL_EXISTS, HTTP_STATUS.CONFLICT);
    }
    const hashedPassword = await hashPassword(data.password);
    const newUser = {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "user",
    };

    await this.userRepository.createUser(newUser);
  }

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
