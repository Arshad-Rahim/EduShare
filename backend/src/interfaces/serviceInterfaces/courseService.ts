import { TCourseAdd } from "../../types/course";

export interface ICourseService {
  addCourse(data: TCourseAdd, thumbnail: string): Promise<void>;
  getAllCourses(): Promise<TCourseAdd[] | null>;
  updateCourse(
    data: TCourseAdd,
    thumbnail: string,
    courseId: string
  ): Promise<void>;
}
