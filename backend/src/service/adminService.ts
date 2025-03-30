import { IUserRepository } from "../interfaces/repositoryInterfaces/IUserRepository";
import { ITutorRepository } from "../interfaces/repositoryInterfaces/ITutorRepository";
import { IAdminService } from "../interfaces/serviceInterfaces/adminService";
import {  TPaginationOptions } from "../types/user";
import { TPaginatedResult } from "../types/tutor";

export class AdminService implements IAdminService {
  constructor(
    private _userRepository: IUserRepository,
    private _tutorRepository: ITutorRepository
  ) {}
  async acceptTutor(tutorId: string): Promise<void> {
    await this._userRepository.acceptTutor(tutorId);
  }
  async updateRejectedReason(id: string, reason: string): Promise<void> {
    await this._tutorRepository.updateRejectedReason(id, reason);
  }

  async usersList(options: TPaginationOptions): Promise<TPaginatedResult> {
    const { page, limit, search, role } = options;
    console.log("pag", page, limit, search, role);
    const { users, total } = await this._userRepository.getUsers({
      page,
      limit,
      search,
      role,
    });
    return {
      users,
      total,
      page,
      limit,
    };
  }

  async updateStatus(id: string, status: boolean): Promise<void> {
    await this._userRepository.updateStatus(id, status);
  }
}
