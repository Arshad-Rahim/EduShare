import {  TUserRegister } from "../../../types/user";

export interface ICreateUserService {
  createUser(data: TUserRegister): Promise<void>;
}