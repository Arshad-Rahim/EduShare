import { IUserRepository } from "../interfaces/repositoryInterfaces/IUserRepository";
import { IAuthService } from "../interfaces/serviceInterfaces/authService";
import { ERROR_MESSAGES, HTTP_STATUS } from "../shared/constant";
import { TUpdatePassword, TUserLogin, TUserModel, TUserRegister } from "../types/user";
import { comparePassword, hashPassword } from "../util/bcrypt";
import { CustomError } from "../util/CustomError";

export class AuthService implements IAuthService {
  constructor(private _userRepository: IUserRepository) {}

  async registerUser(data: TUserRegister): Promise<void> {
    const alredyExisting = await this._userRepository.findByEmail(data.email);
    if (alredyExisting) {
      throw new CustomError(ERROR_MESSAGES.EMAIL_EXISTS, HTTP_STATUS.CONFLICT);
    }
    let hashedPassword = "";
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

    await this._userRepository.createUser(newUser);
  }

  async loginUser(data: TUserLogin): Promise<TUserModel | null> {
    const userData = await this._userRepository.findByEmail(data.email);
    if (!userData) {
      throw new CustomError(
        ERROR_MESSAGES.EMAIL_NOT_FOUND,
        HTTP_STATUS.UNAUTHORIZED
      );
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


  async verifyPassword(id:string,password:string):Promise<boolean>{
    const userData = await this._userRepository.findById(id);
    console.log("USERDATA",userData)
    if (!userData) {
      throw new CustomError(
        ERROR_MESSAGES.USER_NOT_FOUND,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (userData && userData.password) {
      const valid = await comparePassword(password, userData.password);
      if (!valid) {
        throw new CustomError(
          ERROR_MESSAGES.INVALID_PASSWORD,
          HTTP_STATUS.UNAUTHORIZED
        );
      }
      return valid
    }
    return false;
  }

  async resetPassword(data: TUpdatePassword): Promise<boolean> {
    const hashedPassword = await hashPassword(data.newPassword);
    data.newPassword = hashedPassword;

    const updated = await this._userRepository.resetPassword(data);
    return updated;
  }

  async verifyEmail(email: string): Promise<TUserModel | null> {
    console.log("Ivde ankilum varunnunto aavo");
    const userData = await this._userRepository.findByEmail(email);
    console.log("USERDATA:", userData);
    if (!userData) {
      throw new CustomError(
        ERROR_MESSAGES.EMAIL_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }
    return userData;
  }
}
