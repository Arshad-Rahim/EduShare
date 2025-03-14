import { TUserLogin, TUserModel } from "../../../types/user";



export interface ILoginUserService {
  loginUser(data: TUserLogin): Promise<TUserModel | null>;
}