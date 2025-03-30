import { TNotification } from "../../types/notification";
import { TTutorModel, TUpdateTutorProfileBody } from "../../types/tutor";


export interface ITutorService {
  getNotification(id: string): Promise<TNotification[] | null>;
  updateProfile(
    data: TUpdateTutorProfileBody,
    id: string,
    verificationDocUrl: string
  ): Promise<void>;
  getTutorDetails(id: string): Promise<TTutorModel | null>;
  markAllNotificationsAsRead(id: string): Promise<void>;
}