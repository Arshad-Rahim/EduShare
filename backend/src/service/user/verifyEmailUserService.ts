import { IFindByEmailDirectUserRepository } from "../../interfaces/repositoryInterfaces/user/findByEmailUserRepository";
import { IVerifyEmailUserService } from "../../interfaces/serviceInterfaces/user/verifyEmailUserService";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constant";
import { TEmail, TUserModel } from "../../types/user";
import { CustomError } from "../../util/CustomError";



export class VerifyEmailUserService implements IVerifyEmailUserService {
  constructor(private userRepository: IFindByEmailDirectUserRepository) {}

  async verifyEmail(email: string): Promise<TUserModel |null> {
    console.log("Ivde ankilum varunnunto aavo")
    const userData = await this.userRepository.findByEmail(email);
    console.log("USERDATA:",userData)
    if(!userData){
        throw new CustomError(
            ERROR_MESSAGES.EMAIL_NOT_FOUND,
            HTTP_STATUS.NOT_FOUND
        )
    }
    return userData;
  }
}