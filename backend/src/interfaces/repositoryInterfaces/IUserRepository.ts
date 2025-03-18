import {
  TEmail,
  TPaginatedResult,
  TPaginationOptions,
  TUpdatePassword,
  TUserLogin,
  TUserModel,
  TUserRegister,
} from "../../types/user";

export interface IUserRepository {
  createUser(data: TUserRegister): Promise<void>;
  findByEmail(email: string): Promise<TUserModel | null>;
  findAllUsers():Promise<TUserModel[] |null>;
  resetPassword(data:TUpdatePassword):Promise<boolean>;
  getUsers(options:TPaginationOptions):Promise<TPaginatedResult>
}
