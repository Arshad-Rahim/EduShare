import { IGoogleService } from "../../interfaces/googleAuth/googleService";
import { IUserRepository } from "../../interfaces/repositoryInterfaces/IUserRepository";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constant";
import { TUserModel } from "../../types/user";
import { CustomError } from "../../util/CustomError";

export class GoogleService implements IGoogleService {
  constructor(private userRepository: IUserRepository) {}

  async createUser(data: {
    name: string;
    email: string;
    role: string;
  }): Promise<TUserModel | void> {
    const user = await this.userRepository.findByEmail(data.email);

    if (user?.isBlocked) {
      throw new CustomError(
        ERROR_MESSAGES.ADMIN_BLOCKED,
        HTTP_STATUS.UNAUTHORIZED
      );
    }
    let userData;

    if (!user) {
      const newUser = {
        name: data.name,
        email: data.email,
        role: data.role,
        isBlocked: false,
        isAccepted: data.role == "tutor" ? false : true,
      };
      userData = await this.userRepository.createUser(newUser);
    }
if(user){
  return user;
}
    return userData;
  }
}
