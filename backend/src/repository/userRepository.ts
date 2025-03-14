import { userModel } from "../models/userModels";
import {
  TUserLogin,
  TUserModel,
  TUserRegister,
} from "../types/user";
import { IUserRepository } from "../interfaces/repositoryInterfaces/IUserRepository";

export class UserRepository implements IUserRepository {
  async createUser(data: TUserRegister): Promise<void> {
    await userModel.create(data);
  }

  async findByEmail(email: string): Promise<TUserRegister | null> {
    return await userModel.findOne({ email });
  }


}
