import { TUpdateUserProfile } from "../../types/user";

export interface IUserProfileRepository {
  updateUserProfile(data: TUpdateUserProfile, id: string): Promise<void>;
}
