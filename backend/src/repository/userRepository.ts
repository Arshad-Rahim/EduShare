import { userModel } from "../models/userModels";
import {
  TPaginationOptions,
  TUpdatePassword,
  TUserModel,
  TUserRegister,
  TUserWithProfile,
} from "../types/user";
import { IUserRepository } from "../interfaces/repositoryInterfaces/IUserRepository";
import { NotificationModel } from "../models/notificationModel";
import { tutorProfileModel } from "../models/tutorProfileModel";
import { TPaginatedResult } from "../types/tutor";
import { Types } from "mongoose";

export class UserRepository implements IUserRepository {
  async createUser(data: TUserRegister): Promise<TUserModel> {
    const userData = await userModel.create(data);
    return userData;
  }

  async findByEmail(email: string): Promise<TUserModel | null> {
    const user = await userModel.findOne({ email });
    return user;
  }

  // async findById(id: string): Promise<TUserModel | null> {
  //   const user = await userModel.findById(id);
  //   return user;
  // }

  async findById(id: string): Promise<TUserWithProfile | null> {
    // Validate the ID
    if (!Types.ObjectId.isValid(id)) return null;

    // Use aggregation to join user and userProfile collections
    const user = await userModel
      .aggregate([
        { $match: { _id: new Types.ObjectId(id) } }, // Match the user by ID
        {
          $lookup: {
            from: "userprofiles", // Collection name in MongoDB (lowercase + 's' typically)
            localField: "_id",
            foreignField: "userId",
            as: "userProfile",
          },
        },
        {
          $unwind: {
            path: "$userProfile",
            preserveNullAndEmptyArrays: true, // Keep user even if no profile exists
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            password: 1,
            role: 1,
            isBlocked: 1,
            isAccepted: 1,
            "userProfile.education": 1,
            "userProfile.aboutMe": 1,
            "userProfile.interests": 1,
          },
        },
      ])
      .exec();

    // If no user is found, return null
    if (!user || user.length === 0) return null;

    // Extract the first result from the aggregation
    const userData = user[0];

    // Return a formatted object with defaults for optional fields
    return {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      password: userData.password || null,
      role: userData.role || "user",
      isBlocked: userData.isBlocked || false,
      isAccepted: userData.isAccepted || false,
      education: userData.userProfile?.education || "",
      aboutMe: userData.userProfile?.aboutMe || "",
      interests: userData.userProfile?.interests || "",
    };
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
    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const users = await userModel
      .aggregate([
        { $match: query }, // Filter users by role and search
        {
          $lookup: {
            from: "tutorprofiles", // Collection name in MongoDB (lowercase, plural)
            localField: "_id",
            foreignField: "tutorId",
            as: "tutorProfile",
          },
        },
        {
          $unwind: { path: "$tutorProfile", preserveNullAndEmptyArrays: true },
        }, // Optional: handle cases with no profile
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
      ])
      .exec();
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

    return { users: flattenedUsers, total, page, limit };
  }

  async updateStatus(id: string, status: boolean): Promise<void> {
    await userModel.findByIdAndUpdate({ _id: id }, { isBlocked: status });
  }

  async acceptTutor(tutorId: string): Promise<void> {
    await userModel.findByIdAndUpdate({ _id: tutorId }, { isAccepted: true });
    await tutorProfileModel.updateOne(
      { tutorId: tutorId },
      { approvalStatus: "approved" }
    );
    await NotificationModel.create({
      userId: tutorId,
      type: "approval",
      message: "Your tutor profile has been approved by the admin.",
    });
  }

  async updatePassword(id:string,newPassword:string):Promise<void>{
    await userModel.findByIdAndUpdate({_id:id},{password:newPassword})
  }
}
