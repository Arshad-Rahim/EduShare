import { IUserRepository } from "../../interfaces/repositoryInterfaces/IUserRepository";
import { IDeleteUserService } from "../../interfaces/serviceInterfaces/user/deleteUserService";


export class DeleteUserService implements IDeleteUserService{
    constructor(private userRepository:IUserRepository){}

    async deleteUser(id: string): Promise<void> {
        await this.userRepository.deleteUser(id)
    }
}