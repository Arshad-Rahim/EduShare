import { ILessonRepository } from "../interfaces/repositoryInterfaces/ILessonRepository";
import { lessonModel } from "../models/lessonModel";
import { TLessonAdd, TLessonModel } from "../types/course";
import { TUpdateData } from "../types/lesson";

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

  async deleteLesson(lessonId:string):Promise<void>{
    await lessonModel.findByIdAndDelete({_id:lessonId})
  }



  async editLesson(data:TLessonAdd,thumbnail:string,lessonId:string):Promise<void>{


    const updateData: TUpdateData = {
      courseId: data.courseId,
      description: data.description,
      duration: data.duration,
      title: data.title,
      // file: thumbnail,
      order: 0,
    };
    
        
        if (thumbnail.trim() !== "") {
          updateData.file = thumbnail;
        }
    
        await lessonModel.findByIdAndUpdate(lessonId, updateData);
  }
}
