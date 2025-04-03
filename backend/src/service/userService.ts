import { IUserProfileRepository } from "../interfaces/repositoryInterfaces/IUserProfileRepository";
import { IUserRepository } from "../interfaces/repositoryInterfaces/IUserRepository";
import { IUserService } from "../interfaces/serviceInterfaces/userService";
import { TUpdateUserProfile, TUserModel } from "../types/user";
import { hashPassword } from "../util/bcrypt";

export class UserService implements IUserService {
  constructor(
    private _userRepository: IUserRepository,
    private _userProfileRepository: IUserProfileRepository
  ) {}

  async logedInUserData(id: string): Promise<TUserModel | null> {
    const user = await this._userRepository.findById(id);
    return user;
  }

  async updateUserProfile(id: string, data: TUpdateUserProfile): Promise<void> {
    await this._userProfileRepository.updateUserProfile(data, id);
  } 

  async updatePassword(id:string,newPassword:string):Promise<void>{
    const hashedPassword = await hashPassword(newPassword);
    await this._userRepository.updatePassword(id,hashedPassword)
  }
}
