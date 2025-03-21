import { IUserRepository } from "../../interfaces/repositoryInterfaces/IUserRepository";
import { ICreateUserService } from "../../interfaces/serviceInterfaces/user/createUserService";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constant";
import { TUserRegister } from "../../types/user";
import { hashPassword } from "../../util/bcrypt";
import { CustomError } from "../../util/CustomError";

export class CreateUserService implements ICreateUserService {
  constructor(private userRepository: IUserRepository) {}

  async createUser(data: TUserRegister): Promise<void> {
    const alredyExisting = await this.userRepository.findByEmail(data.email);
    if (alredyExisting) {
      throw new CustomError(ERROR_MESSAGES.EMAIL_EXISTS, HTTP_STATUS.CONFLICT);
    }
    let hashedPassword=""
    if (data.password) {
       hashedPassword = await hashPassword(data.password);
    }
    const newUser = {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      isBlocked: false,
      isAccepted: data.role == "tutor" ? false : true,
    };

    await this.userRepository.createUser(newUser);
  }
}
