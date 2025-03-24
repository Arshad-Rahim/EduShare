import { TUpdateTutorProfileBody } from "../../../types/tutor";

export interface IUpdateTutorProfileService {
  updateTutorProfile(
    data: TUpdateTutorProfileBody,
    id: string,
    verificationDocUrl: string
  ): Promise<void>;
}
