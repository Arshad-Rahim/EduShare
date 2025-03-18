import { TUserModel } from "../../../types/user";


export interface IFindAllUsersService{
    findAllUsers():Promise<TUserModel[] |null>
}