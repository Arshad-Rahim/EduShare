import { TUserModel } from "../../types/user";


export interface IGoogleService {
  createUser(data: { name: string; email: string ,role:string}): Promise<TUserModel|void>;
}