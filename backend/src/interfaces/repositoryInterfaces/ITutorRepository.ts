import { TNotification } from "../../types/notification";
import { TTutorModel, TUpdateTutorProfileBody } from "../../types/tutor";

export interface ITutorRepository {
  updateTutorProfile(
    data: TUpdateTutorProfileBody,
    id: string,
    verificationDocUrl: string
  ): Promise<void>;
  updateRejectedReason(id: string, reason: string): Promise<void>;
  getNotifications(id: string): Promise<TNotification[] | null>;
  getTutorDetails(id: string): Promise<TTutorModel | null>;
  markAllNotificationsAsRead(id: string): Promise<void>;
}
