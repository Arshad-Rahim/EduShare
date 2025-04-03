import { LessonController } from "../controller/lessonController";
import { LessonRepository } from "../repository/lessonRepository";
import { LessonService } from "../service/lessonService";


const lessonRepository = new LessonRepository();
const lessonService = new LessonService(lessonRepository);


export const injectedLessonController = new LessonController(lessonService)