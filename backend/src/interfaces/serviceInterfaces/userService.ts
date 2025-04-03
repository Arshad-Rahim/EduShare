import { TUpdateUserProfile, TUserModel } from "../../types/user";

export interface IUserService {
  logedInUserData(id: string): Promise<TUserModel | null>;
  updateUserProfile(id: string, data: TUpdateUserProfile): Promise<void>;
  updatePassword(id: string, newPassword: string): Promise<void>;
}
