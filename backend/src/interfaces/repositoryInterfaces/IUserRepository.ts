import {
  TPaginatedResult,
  TPaginationOptions,
  TUpdatePassword,
  TUserModel,
  TUserRegister,
} from "../../types/user";

export interface IUserRepository {
  createUser(data: TUserRegister): Promise<void | TUserModel>;
  findByEmail(email: string): Promise<TUserModel | null>;
  findAllUsers(): Promise<TUserModel[] | null>;
  resetPassword(data: TUpdatePassword): Promise<boolean>;
  getUsers(options: TPaginationOptions): Promise<TPaginatedResult>;
  deleteUser(id: string): Promise<void>;
  updateStatus(id: string, status: boolean): Promise<void>;
  acceptTutor(tutorId: string): Promise<void>;
  findById(id: string): Promise<TUserModel|null>;
}
