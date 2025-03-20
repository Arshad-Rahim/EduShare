import { IUserRepository } from "../../interfaces/repositoryInterfaces/IUserRepository";
import { IAcceptTutorService } from "../../interfaces/serviceInterfaces/user/acceptTutorService";



export class AcceptTutorService implements IAcceptTutorService{
    constructor(private userRepository:IUserRepository){}

    async acceptTutor(tutorId: string): Promise<void> {
        await this.userRepository.acceptTutor(tutorId)
    }
}