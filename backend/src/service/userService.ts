import { IUserRepository } from "../interfaces/repositoryInterfaces/IUserRepository";
import { IUserService } from "../interfaces/serviceInterfaces/userService";
import { TUserModel } from "../types/user";


export class UserService implements IUserService {
  constructor(private _userRepository: IUserRepository) {}

  async logedInUserData(id: string): Promise<TUserModel | null> {
    const user = await this._userRepository.findById(id);
    return user;
  }
}