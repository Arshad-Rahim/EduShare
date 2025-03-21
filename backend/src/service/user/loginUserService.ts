import { IUserRepository } from "../../interfaces/repositoryInterfaces/IUserRepository";
import { ILoginUserService } from "../../interfaces/serviceInterfaces/user/loginUserService";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constant";
import { TUserLogin, TUserModel } from "../../types/user";
import { comparePassword } from "../../util/bcrypt";
import { CustomError } from "../../util/CustomError";

export class LoginUserService implements ILoginUserService {
  constructor(private userRepository: IUserRepository) {}

  async loginUser(data: TUserLogin): Promise<TUserModel | null> {
    const userData = await this.userRepository.findByEmail(data.email);
    if(!userData){
       throw new CustomError(
        ERROR_MESSAGES.EMAIL_NOT_FOUND,
        HTTP_STATUS.UNAUTHORIZED
       )
    }
    if (userData?.isBlocked) {
      throw new CustomError(
        ERROR_MESSAGES.ADMIN_BLOCKED,
        HTTP_STATUS.UNAUTHORIZED
      );
    }
    if (userData && userData.password) {
     const valid = await comparePassword(data.password, userData.password);
      if (!valid) {
        throw new CustomError(
          ERROR_MESSAGES.INVALID_PASSWORD,
          HTTP_STATUS.UNAUTHORIZED
        );
      }
    }
    const validRole = data.role == userData.role;
    

    if (!validRole) {
      throw new CustomError(
        ERROR_MESSAGES.INVALID_ROLE,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    return userData;
  }
}
