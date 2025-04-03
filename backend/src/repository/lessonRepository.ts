import { ILessonRepository } from "../interfaces/repositoryInterfaces/ILessonRepository";
import { lessonModel } from "../models/lessonModel";
import { TLessonAdd, TLessonModel } from "../types/course";

export class LessonRepository implements ILessonRepository {
  async addLesson(data: TLessonAdd,thumbnail:string): Promise<void> {
    await lessonModel.create({
      courseId: data.courseId,
      description: data.description,
      duration: data.duration,
      title: data.title,
      file: thumbnail,
      order: 0,
    });
  }

  async getLessons(courseId:string):Promise<TLessonModel[] | null>{
    return await lessonModel.find({courseId:courseId})
  }
}
