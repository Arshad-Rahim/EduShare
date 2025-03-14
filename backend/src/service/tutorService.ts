import { IUserRepository } from "../interfaces/repositoryInterfaces/IUserRepository";
import { IOtpService } from "../interfaces/serviceInterfaces/otpServiceInterface";
import { ITutorService } from "../interfaces/serviceInterfaces/tutorServiceInterface";
import { ERROR_MESSAGES, HTTP_STATUS } from "../shared/constant";
import { TVerifyOtpToRegister } from "../types/otp";
import { TUserModel, TUserRegister } from "../types/user";
import { hashPassword } from "../util/bcrypt";
import { CustomError } from "../util/CustomError";

export class TutorService implements ITutorService {
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
      role: "tutor",
    };

    await this.userRepository.createUser(newUser);
  }
}
