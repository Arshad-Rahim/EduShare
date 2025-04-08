import { TCourseAdd } from "../../types/course";
import { TCourseFilterOptions } from "../../types/user";


export interface ICourseRepository {
  addCourse(
    data: TCourseAdd,
    thumbnail: string,
    tutorId: string
  ): Promise<void>;
  getTutorCourses(tutorId: string): Promise<TCourseAdd[] | null>;
  editCourse(
    data: TCourseAdd,
    thumbnail: string,
    courseId: string
  ): Promise<void>;
  deleteCourse(courseId: string): Promise<void>;
  getAllCourses(
    options: TCourseFilterOptions
  ): Promise<{ courses: TCourseAdd[]; total: number }>;
}