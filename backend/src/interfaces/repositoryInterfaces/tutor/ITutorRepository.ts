import { TNotification } from "../../../types/notification";
import { TUpdateTutorProfileBody } from "../../../types/tutor";

export interface ITutorRepository {
  updateTutorProfile(
    data: TUpdateTutorProfileBody,
    id: string,
    verificationDocUrl: string
  ): Promise<void>;
  updateRejectedReason(id: string, reason: string): Promise<void>;
  findNotifications(id:string):Promise<TNotification[] | null>;
}
