import { TEmail, TUserModel } from "../../../types/user";


export interface IFindByEmailUserRepository{
    findByEmail(data: TEmail): Promise<TUserModel | null>
}