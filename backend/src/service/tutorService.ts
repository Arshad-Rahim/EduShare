import { ITutorRepository } from "../interfaces/repositoryInterfaces/ITutorRepository";
import { ITutorService } from "../interfaces/serviceInterfaces/tutorServiceInterface";
import { TNotification } from "../types/notification";
import { TTutorModel, TUpdateTutorProfileBody } from "../types/tutor";
import { TStudent } from "../types/user";

export class TutorService implements ITutorService {
  constructor(private _tutorRepository: ITutorRepository) {}
  async getNotification(id: string): Promise<TNotification[] | null> {
    const notification = await this._tutorRepository.getNotifications(id);
    return notification;
  }

  async updateProfile(
    data: TUpdateTutorProfileBody,
    id: string,
    verificationDocUrl: string
  ): Promise<void> {
    await this._tutorRepository.updateTutorProfile(
      data,
      id,
      verificationDocUrl
    );
  }

  async getTutorDetails(id: string): Promise<TTutorModel | null> {
    const tutor = await this._tutorRepository.getTutorDetails(id);
    return tutor;
  }

  async markAllNotificationsAsRead(id: string): Promise<void> {
    await this._tutorRepository.markAllNotificationsAsRead(id);
  }

  async  getEnrolledStudent(
       tutorId: string
     ): Promise<{ students: TStudent[]; totalRevenue: number }>{
      const { students, totalRevenue } =
        await this._tutorRepository.getEnrolledStudent(tutorId);
      return {students,totalRevenue};
  }


}
