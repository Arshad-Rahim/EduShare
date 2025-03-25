import { IUserRepository } from "../../interfaces/repositoryInterfaces/IUserRepository";
import { ITutorRepository } from "../../interfaces/repositoryInterfaces/tutor/ITutorRepository";
import { IUpdateTutorProfileService } from "../../interfaces/serviceInterfaces/tutor/updateTutorProfileService";
import { TUpdateTutorProfileBody } from "../../types/tutor";

export class UpdateTutorProfileService implements IUpdateTutorProfileService {
  constructor(
    // private userRepository: IUserRepository,
    private tutorRepository: ITutorRepository
  ) {}
  async updateTutorProfile(
    data: TUpdateTutorProfileBody,
    id: string,
    verificationDocUrl: string,
  ): Promise<void> {
    await this.tutorRepository.updateTutorProfile(data, id, verificationDocUrl);
  }
}
