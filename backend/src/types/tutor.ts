import { Types } from "mongoose";

export type TUpdateTutorProfileBody = {
  userId: string;
  name: string;
  phone: string;
  specialization: string;
  bio: string;
};

export type TTutorModel = {
  name: string;
  email: string;
  password?: string | null | undefined;
  role: string;
  _id?: Types.ObjectId;
  isBlocked: boolean;
  isAccepted?: boolean;
  specialization: string;
  verificationDocUrl: string;
  approvalStatus: string;
  phone: string;
  bio: string;
  rejectionReason?: string;
};

export type TPaginatedResult = {
  users: TTutorModel[];
  total: number;
  page: number;
  limit: number;
};

export type TUpdateData = {
  tutorId: string;
  phone: string;
  specialization: string;
  bio: string;
  approvalStatus: string;
  verificationDocUrl?: string;
};

export type TEnrolledStudent = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  amount: number;
};

export type TEnrolledStudentsResponse = {
  students: TEnrolledStudent[];
  totalRevenue: number;
};


export interface TrendingTutor {
  tutorId: string;
  tutorName: string;
  enrollmentCount: number;
}