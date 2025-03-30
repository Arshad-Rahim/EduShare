import { TUserModel } from "../../types/user";

export interface IUserService {
  logedInUserData(id: string): Promise<TUserModel | null>;
  
}
