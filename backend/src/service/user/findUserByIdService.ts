import { IUserRepository } from "../../interfaces/repositoryInterfaces/IUserRepository";
import { IFindUserByIdService } from "../../interfaces/serviceInterfaces/user/findUserByIdService";
import { TUserModel } from "../../types/user";


export class FindUserByIdService implements IFindUserByIdService{
    constructor(private userRepository:IUserRepository){}

    async findById(id: string): Promise<TUserModel | null> {
        const user = await this.userRepository.findById(id);
        return user
    }
}