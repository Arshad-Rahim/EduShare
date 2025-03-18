import { IUserRepository } from "../../interfaces/repositoryInterfaces/IUserRepository";
import { IFindAllUsersService } from "../../interfaces/serviceInterfaces/user/findAllUserService";
import { TUserModel } from "../../types/user";


export class FindAllUsersService implements IFindAllUsersService{
    constructor(private userRepository:IUserRepository){}

    async findAllUsers():Promise<TUserModel[] |null>{
        const users = await this.userRepository.findAllUsers();
        return users;
    }
}