import { ITutorRepository } from "../../interfaces/repositoryInterfaces/tutor/ITutorRepository";
import { IFindNotificationService } from "../../interfaces/serviceInterfaces/tutor/findNotificationService";
import { TNotification } from "../../types/notification";


export class FindNotificationService implements IFindNotificationService{
    constructor(private tutorRepository:ITutorRepository){}

    async findNotifications(id: string): Promise<TNotification[] | null> {
        const notification = await this.tutorRepository.findNotifications(id);
        return notification;
    }
}