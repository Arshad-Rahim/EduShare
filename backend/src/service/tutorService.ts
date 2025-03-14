import { IFindByEmailUserRepository } from "../interfaces/repositoryInterfaces/user/findByEmailUserRepository";
import { ITutorService } from "../interfaces/serviceInterfaces/tutorServiceInterface";
import { ICreateUserService } from "../interfaces/serviceInterfaces/user/createUserService";
import { ERROR_MESSAGES, HTTP_STATUS } from "../shared/constant";
import { TUserRegister } from "../types/user";
import { hashPassword } from "../util/bcrypt";
import { CustomError } from "../util/CustomError";

export class TutorService implements ITutorService {
  constructor(
    private userRepository: IFindByEmailUserRepository,
    private userRepositoryCreateUser: ICreateUserService
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

    await this.userRepositoryCreateUser.createUser(newUser);
  }
}
