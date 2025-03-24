import { ITutorRepository } from "../interfaces/repositoryInterfaces/tutor/ITutorRepository";
import { NotificationModel } from "../models/notificationModel";
import { tutorProfileModel } from "../models/tutorProfileModel";
import { userModel } from "../models/userModels";
import { TNotification } from "../types/notification";
import { TUpdateTutorProfileBody } from "../types/tutor";

export class TutorRepository implements ITutorRepository {
  async updateTutorProfile(
    data: TUpdateTutorProfileBody,
    id: string,
    verificationDocUrl: string
  ): Promise<void> {
    console.log("DATAAA USERRRR", data);
    await tutorProfileModel.updateOne(
      { tutorId: id },
      {
        tutorId: id,
        phone: data.phone,
        specialization: data.specialization,
        bio: data.bio,
        verificationDocUrl,
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


  async findNotifications(id:string):Promise<TNotification[]|null>{
   const notification = await NotificationModel.find({userId:id});
   return notification as TNotification[];
  }
}
