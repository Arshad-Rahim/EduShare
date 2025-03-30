import { Types } from "mongoose";
import { ITutorRepository } from "../interfaces/repositoryInterfaces/ITutorRepository";
import { NotificationModel } from "../models/notificationModel";
import { tutorProfileModel } from "../models/tutorProfileModel";
import { userModel } from "../models/userModels";
import { TNotification } from "../types/notification";
import { TTutorModel, TUpdateTutorProfileBody } from "../types/tutor";

export class TutorRepository implements ITutorRepository {
  async updateTutorProfile(
    data: TUpdateTutorProfileBody,
    id: string,
    verificationDocUrl: string
  ): Promise<void> {
    await tutorProfileModel.updateOne(
      { tutorId: id },
      {
        tutorId: id,
        phone: data.phone,
        specialization: data.specialization,
        bio: data.bio,
        verificationDocUrl,
        approvalStatus: "pending",
      },
      { upsert: true }
    );
    await userModel.findOneAndUpdate({ _id: id }, { name: data.name });
  }

  async updateRejectedReason(id: string, reason: string): Promise<void> {
    await tutorProfileModel.updateOne(
      { tutorId: id },
      { rejectionReason: reason, approvalStatus: "rejected" }
    );

    await NotificationModel.create({
      userId: id,
      type: "rejection",
      message: "Your tutor profile has been rejected by the admin.",
      reason,
    });
  }

  async getNotifications(id: string): Promise<TNotification[] | null> {
    const notification = await NotificationModel.find({ userId: id });
    return notification as TNotification[];
  }

  async getTutorDetails(id: string): Promise<TTutorModel | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const tutor = await userModel
      .aggregate([
        { $match: { _id: new Types.ObjectId(id), role: "tutor" } },
        {
          $lookup: {
            from: "tutorprofiles",
            localField: "_id",
            foreignField: "tutorId",
            as: "tutorProfile",
          },
        },
        {
          $unwind: { path: "$tutorProfile", preserveNullAndEmptyArrays: true },
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
            "tutorProfile.specialization": 1,
            "tutorProfile.verificationDocUrl": 1,
            "tutorProfile.approvalStatus": 1,
            "tutorProfile.phone": 1,
            "tutorProfile.bio": 1,
            "tutorProfile.rejectionReason": 1,
          },
        },
      ])
      .exec();

    if (!tutor || tutor.length === 0) return null;

    const tutorData = tutor[0];
    return {
      _id: tutorData._id,
      name: tutorData.name,
      email: tutorData.email,
      password: tutorData.password || null,
      role: tutorData.role,
      isBlocked: tutorData.isBlocked || false,
      isAccepted: tutorData.isAccepted || false,
      specialization: tutorData.tutorProfile?.specialization || "",
      verificationDocUrl: tutorData.tutorProfile?.verificationDocUrl || "",
      approvalStatus: tutorData.tutorProfile?.approvalStatus || "pending",
      phone: tutorData.tutorProfile?.phone || "",
      bio: tutorData.tutorProfile?.bio || "",
      rejectionReason: tutorData.tutorProfile?.rejectionReason || "",
    };
  }
}
