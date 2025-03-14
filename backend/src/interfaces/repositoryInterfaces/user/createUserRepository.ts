import { TUserRegister } from "../../../types/user";


export interface ICreateUserRepository{
    createUser(data:TUserRegister):Promise<void>;
}