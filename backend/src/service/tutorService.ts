import { IUserRepository } from "../interfaces/repositoryInterfaces/IUserRepository";
import { IOtpService } from "../interfaces/serviceInterfaces/otpServiceInterface";
import { IUserService } from "../interfaces/serviceInterfaces/userServiceInterface";
import { TVerifyOtpToRegister } from "../types/otp";
import { TUserModel, TUserRegister } from "../types/user";
import { hashPassword } from "../util/bcrypt";

export class TutorService implements IUserService {
  constructor(
    private userRepository: IUserRepository,
    private otpService: IOtpService
  ) {}

  async createUser(data: TUserRegister): Promise<void> {
    const alredyExisting = await this.userRepository.findByEmail(data);

    if (alredyExisting) {
      throw new Error("Email alredy existing");
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

  // test cheyyan vendi idith itteth aan

  async verifyOtpToRegister(
    data: TVerifyOtpToRegister
  ): Promise<TUserModel | null> {
    const isOtpValid = await this.otpService.verifyOtp(data);
    if (!isOtpValid) {
      throw new Error("OTP verification failed");
    }

    const user = await this.userRepository.findByEmail(data);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}
