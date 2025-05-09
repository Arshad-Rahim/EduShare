import { CoursePurchaseCount, TCourseAdd } from "../../types/course";
import { TCourseFilterOptions } from "../../types/user";

export interface ICourseService {
  addCourse(
    data: TCourseAdd,
    thumbnail: string,
    tutorId: string
  ): Promise<void>;
  getTutorCourses(
    tutorId: string,
    page: number,
    limit: number
  ): Promise<{ courses: TCourseAdd[] | null; totalCourses: number }>;
  updateCourse(
    data: TCourseAdd,
    thumbnail: string,
    courseId: string
  ): Promise<void>;
  getAllCourses(
    options: TCourseFilterOptions
  ): Promise<{ courses: TCourseAdd[]; total: number }>;
  deleteCourse(courseId: string): Promise<void>;
  purchaseStatus(userId: string, courseId: string): Promise<boolean>;
  getEnrolledCourses(userId: string): Promise<TCourseAdd[]>;
  getCourseDetails(courseId: string): Promise<TCourseAdd | null>;
  getCourseTotalCount(): Promise<number>;
  coursePurchaseCount(): Promise<CoursePurchaseCount[]> 
}
