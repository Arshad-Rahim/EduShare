import { TNotification } from "../../../types/notification";


export interface IFindNotificationService {
  findNotifications(id:string):Promise<TNotification[] | null>
}