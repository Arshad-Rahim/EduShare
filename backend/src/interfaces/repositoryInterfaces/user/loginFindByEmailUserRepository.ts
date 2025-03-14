import { TUserLogin, TUserModel } from "../../../types/user";



export interface ILoginFindByEmailUserRepository{
    findByEmail(data:TUserLogin):Promise<TUserModel | null>;
}