import { TUserModel } from "../../../types/user";


export interface IFindAllUsersRepository{
    findAllUsers():Promise<TUserModel[] |null>
}