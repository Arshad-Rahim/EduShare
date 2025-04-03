import { CourseController } from "../controller/courseController";
import { CourseRepository } from "../repository/courseRepository";
import { CourseService } from "../service/courseService";

const courseRepository = new CourseRepository();

const courseService = new CourseService(courseRepository);


export const injectedCourseController = new CourseController(courseService)