import { IUserRepository } from "../../interfaces/repositoryInterfaces/IUserRepository";
import { IResetPasswordService } from "../../interfaces/serviceInterfaces/user/resetPasswordService";
import { TUpdatePassword } from "../../types/user";
import { hashPassword } from "../../util/bcrypt";

export class ResetPasswordService implements IResetPasswordService {
  constructor(private userRepository: IUserRepository) {}

  async resetPassword(data: TUpdatePassword): Promise<boolean> {
    const hashedPassword = await hashPassword(data.newPassword);
    data.newPassword = hashedPassword;

    const updated = await this.userRepository.resetPassword(data);
    return updated;
  }
}
