import { TUserModel } from "../../../types/user";


export interface IFindUserByIdService{
    findById(id:string):Promise<TUserModel|null>
}