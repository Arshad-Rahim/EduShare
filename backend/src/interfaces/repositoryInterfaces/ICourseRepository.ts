import { TCourseAdd } from "../../types/course";


export interface ICourseRepository {
  addCourse(data: TCourseAdd, thumbnail: string): Promise<void>;
  getAllCourses(): Promise<TCourseAdd[] | null>;
  editCourse(
    data: TCourseAdd,
    thumbnail: string,
    courseId: string
  ): Promise<void>;
  deleteCourse(courseId: string): Promise<void>;
}