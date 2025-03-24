import { userModel } from "../models/userModels";
import { TPaginatedResult, TPaginationOptions, TUpdatePassword, TUserModel, TUserRegister } from "../types/user";
import { IUserRepository } from "../interfaces/repositoryInterfaces/IUserRepository";
import { NotificationModel } from "../models/notificationModel";

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
const users = await userModel.aggregate([
  { $match: query }, // Filter users by role and search
  {
    $lookup: {
      from: "tutorprofiles", // Collection name in MongoDB (lowercase, plural)
      localField: "_id",
      foreignField: "tutorId",
      as: "tutorProfile",
    },
  },
  { $unwind: { path: "$tutorProfile", preserveNullAndEmptyArrays: true } }, // Optional: handle cases with no profile
  {
    $project: {
      _id: 1,
      name: 1,
      email: 1,
      role: 1,
      isBlocked: 1, // Assuming this exists in UserModel
      lastActive: 1, // Assuming this exists in UserModel
      "tutorProfile.specialization": 1,
      "tutorProfile.verificationDocUrl": 1,
      "tutorProfile.approvalStatus": 1,
      "tutorProfile.phone": 1,
      "tutorProfile.bio": 1,
    },
  },
  { $skip: skip },
  { $limit: limit },
]).exec();
    const total = await userModel.countDocuments(query);


    const flattenedUsers = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked || false,
      // lastActive: user.lastActive || new Date().toISOString(),
      specialization: user.tutorProfile?.specialization || "",
      verificationDocUrl: user.tutorProfile?.verificationDocUrl || "",
      approvalStatus: user.tutorProfile?.approvalStatus || "pending",
      phone: user.tutorProfile?.phone || "",
      bio: user.tutorProfile?.bio || "",
    }));

    return { users:flattenedUsers, total, page, limit };
  }

  async deleteUser(id: string): Promise<void> {
    await userModel.findByIdAndDelete(id);
  }

  async updateStatus(id: string, status: boolean): Promise<void> {
    await userModel.findByIdAndUpdate({ _id: id }, { isBlocked: status });
  }

  async acceptTutor(tutorId: string): Promise<void> {
    await userModel.findByIdAndUpdate({ _id: tutorId }, { isAccepted: true });
    await NotificationModel.create({
      userId: tutorId,
      type: "approval",
      message: "Your tutor profile has been approved by the admin.",
    });
  }
}
