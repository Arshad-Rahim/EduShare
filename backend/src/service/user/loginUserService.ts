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
    if(userData?.isBlocked){
       throw new CustomError(
         ERROR_MESSAGES.ADMIN_BLOCKED,
         HTTP_STATUS.UNAUTHORIZED
       );
    }
    let valid;
    if (userData) {
      valid = await comparePassword(data.password, userData.password);
    }


    const validRole = data.role == userData?.role ? true : false;
    if (!valid || !validRole) {
      throw new CustomError(
        ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
        HTTP_STATUS.UNAUTHORIZED
      );
    }
    
    return userData;
  }
}
