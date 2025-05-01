import { TCourseAdd } from "../../types/course";
import { TCourseFilterOptions } from "../../types/user";


export interface ICourseRepository {
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
  editCourse(
    data: TCourseAdd,
    thumbnail: string,
    courseId: string
  ): Promise<void>;
  deleteCourse(courseId: string): Promise<void>;
  getAllCourses(
    options: TCourseFilterOptions
  ): Promise<{ courses: TCourseAdd[]; total: number }>;
  purchaseStatus(userId: string, courseId: string): Promise<boolean>;
   getEnrolledCourses(userId:string):Promise<TCourseAdd[]>
   getCourseDetails(courseId:string):Promise<TCourseAdd | null>
}