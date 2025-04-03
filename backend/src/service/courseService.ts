import { ICourseService } from "../interfaces/serviceInterfaces/courseService";
import { CourseRepository } from "../repository/courseRepository";
import { TCourseAdd } from "../types/course";

export class CourseService implements ICourseService{
    constructor(private _courseRepository:CourseRepository){}

    async addCourse(data:TCourseAdd,thumbnail:string):Promise<void>{
        await this._courseRepository.addCourse(data,thumbnail)
    }

    async getAllCourses():Promise<TCourseAdd[] |null>{
      const courses =  await this._courseRepository.getAllCourses();
      return courses;
    }

    async updateCourse(data:TCourseAdd,thumbnail:string,courseId:string):Promise<void>{
      await this._courseRepository.editCourse(data,thumbnail,courseId)
    }

    async deleteCourse(courseId:string):Promise<void>{
      await this._courseRepository.deleteCourse(courseId);
    }
}