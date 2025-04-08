import { ICourseService } from "../interfaces/serviceInterfaces/courseService";
import { CourseRepository } from "../repository/courseRepository";
import { TCourseAdd } from "../types/course";
import { TCourseFilterOptions } from "../types/user";

export class CourseService implements ICourseService {
  constructor(private _courseRepository: CourseRepository) {}

  async addCourse(
    data: TCourseAdd,
    thumbnail: string,
    tutorId: string
  ): Promise<void> {
    await this._courseRepository.addCourse(data, thumbnail, tutorId);
  }

  async getTutorCourses(tutorId: string): Promise<TCourseAdd[] | null> {
    const courses = await this._courseRepository.getTutorCourses(tutorId);
    return courses;
  }

  async updateCourse(
    data: TCourseAdd,
    thumbnail: string,
    courseId: string
  ): Promise<void> {
    await this._courseRepository.editCourse(data, thumbnail, courseId);
  }

  async deleteCourse(courseId: string): Promise<void> {
    await this._courseRepository.deleteCourse(courseId);
  }

  async getAllCourses(options:TCourseFilterOptions):Promise<{courses: TCourseAdd[]; total: number }>{
    return this._courseRepository.getAllCourses(options);
  }
}