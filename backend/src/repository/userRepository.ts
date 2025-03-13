import { userModel } from "../models/userModels";
import { TOtpVerify, TUserModel, TUserRegister } from "../types/user";
import { IUserRepository } from "../interfaces/repositoryInterfaces/IUserRepository";

export class UserRepository implements IUserRepository {
  async createUser(data: TUserRegister): Promise<void> {
    await userModel.create(data);
  }

  async findByEmail(data: TUserRegister): Promise<TUserRegister | null> {
    return await userModel.findOne({ email: data.email });
  }


}
