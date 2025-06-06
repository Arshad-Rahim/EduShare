import { TNotification } from "../../types/notification";
import { TrendingTutor, TTutorModel, TUpdateTutorProfileBody } from "../../types/tutor";
import { TStudent } from "../../types/user";


export interface ITutorService {
  getNotification(id: string): Promise<TNotification[] | null>;
  updateProfile(
    data: TUpdateTutorProfileBody,
    id: string,
    verificationDocUrl: string
  ): Promise<void>;
  getTutorDetails(id: string): Promise<TTutorModel | null>;
  markAllNotificationsAsRead(id: string): Promise<void>;
 getEnrolledStudent(
     tutorId: string
   ): Promise<{ students: TStudent[]; totalRevenue: number }>
   tutorPurchaseCount(): Promise<TrendingTutor[]>
}