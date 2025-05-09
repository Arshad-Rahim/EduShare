import { TPaginatedResult } from "../../types/tutor";
import { TPaginationOptions } from "../../types/user";

export interface IAdminService {
  acceptTutor(tutorId: string): Promise<void>;
  updateRejectedReason(id: string, reason: string): Promise<void>;
  usersList(options: TPaginationOptions): Promise<TPaginatedResult>;
  updateStatus(id: string, status: boolean): Promise<void>;
}
