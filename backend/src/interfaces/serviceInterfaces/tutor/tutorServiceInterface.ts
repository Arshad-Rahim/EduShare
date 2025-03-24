import { TUserRegister } from "../../../types/user";


export interface ITutorService{
    createUser(data : TUserRegister):Promise<void>
}