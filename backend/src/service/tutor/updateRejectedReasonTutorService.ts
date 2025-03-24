import { ITutorRepository } from "../../interfaces/repositoryInterfaces/tutor/ITutorRepository";
import { IUpdateRejectedReasonTutorService } from "../../interfaces/serviceInterfaces/tutor/updateRejectedReasonTutorService";



export class UpdateRejectedReasonTutorService implements IUpdateRejectedReasonTutorService{
    constructor(private tutorRepository:ITutorRepository){}


    async  updateRejectedReason(id: string, reason: string): Promise<void> {
        await this.tutorRepository.updateRejectedReason(id,reason)
    }
}