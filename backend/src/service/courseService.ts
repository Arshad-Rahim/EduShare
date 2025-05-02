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

  async getTutorCourses(
    tutorId: string,
    page: number,
    limit: number
  ): Promise<{ courses: TCourseAdd[] | null; totalCourses: number }> {
    const {courses,totalCourses} = await this._courseRepository.getTutorCourses(
      tutorId,
      page,
      limit
    );
    return {courses,totalCourses};
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

  async getAllCourses(
    options: TCourseFilterOptions
  ): Promise<{ courses: TCourseAdd[]; total: number }> {
    return this._courseRepository.getAllCourses(options);
  }


  async purchaseStatus(userId: string, courseId: string): Promise<boolean> {
      return this._courseRepository.purchaseStatus(userId,courseId)
  }
  async getEnrolledCourses(userId: string): Promise<TCourseAdd[]> {
      return this._courseRepository.getEnrolledCourses(userId)
  }


  async getCourseDetails(courseId: string): Promise<TCourseAdd | null> {
      return this._courseRepository.getCourseDetails(courseId)
  }

  async getCourseTotalCount(): Promise<number> {
      return this._courseRepository.getCourseTotalCount();
  }


}
