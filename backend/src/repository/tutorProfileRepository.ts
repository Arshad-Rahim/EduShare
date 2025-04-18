import { Types } from "mongoose";
import { ITutorRepository } from "../interfaces/repositoryInterfaces/ITutorRepository";
import { NotificationModel } from "../models/notificationModel";
import { tutorProfileModel } from "../models/tutorProfileModel";
import { userModel } from "../models/userModels";
import { TNotification } from "../types/notification";
import {
  TTutorModel,
  TUpdateData,
  TUpdateTutorProfileBody,
} from "../types/tutor";
import { courseModel } from "../models/courseModel";
import { TStudent } from "../types/user";
// import { PipelineStage } from "mongoose";
import mongoose from "mongoose";
import { purchaseModel } from "../models/purchaseModel";

export class TutorRepository implements ITutorRepository {
  async updateTutorProfile(
    data: TUpdateTutorProfileBody,
    id: string,
    verificationDocUrl: string
  ): Promise<void> {
    const updateData: TUpdateData = {
      tutorId: id,
      phone: data.phone,
      specialization: data.specialization,
      bio: data.bio,
      approvalStatus: "pending",
    };

    // Only add `verificationDocUrl` if it's not an empty string
    if (verificationDocUrl.trim() !== "") {
      updateData.verificationDocUrl = verificationDocUrl;
    }

    await tutorProfileModel.updateOne({ tutorId: id }, updateData, {
      upsert: true,
    });

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

  async markAllNotificationsAsRead(id: string): Promise<void> {
    await NotificationModel.updateMany(
      { userId: id },
      { $set: { read: true } }
    );
  }
  async getEnrolledStudent(
    tutorId: string
  ): Promise<{ students: TStudent[]; totalRevenue: number }> {
    if (!Types.ObjectId.isValid(tutorId)) {
      console.log("Invalid tutorId:", tutorId);
      return { students: [], totalRevenue: 0 };
    }

    const tutorObjectId = new mongoose.Types.ObjectId(tutorId);

    // Step 1: Find all courses created by this tutor
    const tutorCourses = await courseModel.find({ tutorId: tutorObjectId });

    // If tutor has no courses, return empty array and zero revenue
    if (!tutorCourses.length) {
      return { students: [], totalRevenue: 0 };
    }

    // Create a map of course IDs to course names for quick lookup
    const courseMap = new Map<string, string>();
    tutorCourses.forEach((course) => {
      courseMap.set(course._id.toString(), course.title); // Assuming 'title' is the course name field
    });

    // Extract course IDs
    const courseIds = tutorCourses.map((course) => course._id);

    // Step 2: Find all purchases containing these courses
    const purchases = await purchaseModel.find({
      "purchase.courseId": { $in: courseIds },
    });

    // Step 3: Build student data with course, purchase date, amount, and calculate total revenue
    let totalRevenue = 0;
    const studentDataMap = new Map<
      string,
      {
        name: string;
        email: string;
        role: string;
        courses: { course: string; purchaseDate: Date; amount: number }[];
      }
    >();

    purchases.forEach((purchase) => {
      if (!purchase.userId) return;

      const userId = purchase.userId.toString();
      purchase.purchase.forEach((item) => {
        if (courseIds.some((courseId) => courseId.equals(item.courseId))) {
          const courseIdStr = item.courseId.toString();
          const courseName = courseMap.get(courseIdStr) || "Unknown Course";
          const amount = item.amount;

          // Add to total revenue
          totalRevenue += amount;

          if (!studentDataMap.has(userId)) {
            studentDataMap.set(userId, {
              name: "",
              email: "",
              role: "",
              courses: [],
            });
          }

          studentDataMap.get(userId)!.courses.push({
            course: courseName,
            purchaseDate: item.createdAt || purchase._id.getTimestamp(), // Use item.createdAt with fallback
            amount: amount,
          });
        }
      });
    });

    // Step 4: Fetch student details for these IDs
    const studentIds = Array.from(studentDataMap.keys());
    const studentObjectIds = studentIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const students = await userModel.find(
      {
        _id: { $in: studentObjectIds },
      },
      { name: 1, email: 1, role: 1 } // Project only the fields you need
    );

    // Step 5: Combine student details with course purchase data
    students.forEach((student) => {
      const userId = student._id.toString();
      if (studentDataMap.has(userId)) {
        studentDataMap.get(userId)!.name = student.name;
        studentDataMap.get(userId)!.email = student.email;
        studentDataMap.get(userId)!.role = student.role;
      }
    });

    // Step 6: Format the response according to TStudent type
    const result: TStudent[] = [];
    studentDataMap.forEach((data, userId) => {
      data.courses.forEach((courseData) => {
        result.push({
          _id: userId,
          name: data.name,
          email: data.email,
          role: data.role,
          course: courseData.course,
          purchaseDate: courseData.purchaseDate,
          amount: courseData.amount,
        });
      });
    });

    return { students: result, totalRevenue };
  }
}
