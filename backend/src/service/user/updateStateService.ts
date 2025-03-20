import { IUserRepository } from "../../interfaces/repositoryInterfaces/IUserRepository";
import { IUpdateStatusService } from "../../interfaces/serviceInterfaces/user/updateStateService";


export class UpdateStatusService implements IUpdateStatusService{
    constructor(private userRepository:IUserRepository){}

    async updateStatus(id: string, status: boolean): Promise<void> {
        await this.userRepository.updateStatus(id,status)
    }
}