export interface IUpdateRejectedReasonTutorService {
  updateRejectedReason(id: string, reason: string): Promise<void>;
}
