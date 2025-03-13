import { TOtp } from "../../types/otp";
import { TEmail, TUserLogin, TUserModel, TUserRegister } from "../../types/user";

export interface IUserRepository {
  createUser(data: TUserRegister): Promise<void>;
  findByEmail(data: TEmail): Promise<TUserModel | null>;
}