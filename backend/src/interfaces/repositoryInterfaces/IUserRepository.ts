import {
  TEmail,
  TUserLogin,
  TUserModel,
  TUserRegister,
} from "../../types/user";

export interface IUserRepository {
  createUser(data: TUserRegister): Promise<void>;
  findByEmail(email: string): Promise<TUserModel | null>;
}
