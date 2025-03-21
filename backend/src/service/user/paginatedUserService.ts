import { IUserRepository } from "../../interfaces/repositoryInterfaces/IUserRepository";
import { IPaginatedUserService } from "../../interfaces/serviceInterfaces/user/paginatedUserService";
import { TPaginationOptions, TPaginatedResult } from "../../types/user";


export class PaginatedUserService implements IPaginatedUserService{
    constructor(private userRepository:IUserRepository){}

    async getUsers(options: TPaginationOptions): Promise<TPaginatedResult> {
        const { page, limit, search, role } = options;
        console.log("pag", page, limit, search, role);
        const { users, total } = await this.userRepository.getUsers({
          page,
          limit,
          search,
          role,
        });
        return {
          users,
          total,
          page,
          limit,
        };
    }
}