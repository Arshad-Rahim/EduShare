import { TPaginatedResult, TPaginationOptions } from "../../../types/user";


export interface IPaginatedUserService {
  getUsers(options:TPaginationOptions):Promise<TPaginatedResult>;
}