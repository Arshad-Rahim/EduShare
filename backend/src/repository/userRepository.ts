import { userModel } from "../models/userModels";
import { TPaginatedResult, TPaginationOptions, TUpdatePassword, TUserModel, TUserRegister } from "../types/user";
import { IUserRepository } from "../interfaces/repositoryInterfaces/IUserRepository";

export class UserRepository implements IUserRepository {
  async createUser(data: TUserRegister): Promise<TUserModel> {
    const userData =await userModel.create(data);
    return userData;
  }

  async findByEmail(email: string): Promise<TUserModel | null> {
    const user = await userModel.findOne({ email });
    return user;
  }

  async findById(id: string): Promise<TUserModel | null> {
    const user = await userModel.findById(id);
    return user;
  }

  async findAllUsers(): Promise<TUserModel[] | null> {
    const users = await userModel.find();
    console.log(users);
    return users;
  }

  async resetPassword(data: TUpdatePassword): Promise<boolean> {
    const updated = await userModel.findOneAndUpdate(
      { email: data.email },
      { password: data.newPassword }
    );
    if (updated) {
      return true;
    } else {
      return false;
    }
  }

  async getUsers({
    page,
    limit,
    search,
    role,
  }: TPaginationOptions): Promise<TPaginatedResult> {
    const query: any = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const users = await userModel.find(query).skip(skip).limit(limit).lean();
    const total = await userModel.countDocuments(query);

    return { users, total, page, limit };
  }

  async deleteUser(id: string): Promise<void> {
    await userModel.findByIdAndDelete(id);
  }

  async updateStatus(id: string, status: boolean): Promise<void> {
    await userModel.findByIdAndUpdate({ _id: id }, { isBlocked: status });
  }

  async acceptTutor(tutorId: string): Promise<void> {
    await userModel.findByIdAndUpdate({ _id: tutorId }, { isAccepted: true });
  }
}
