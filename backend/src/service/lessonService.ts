import { ILessonService } from "../interfaces/serviceInterfaces/lessonService";
import { LessonRepository } from "../repository/lessonRepository";
import { TLessonAdd, TLessonModel } from "../types/course";

export class LessonService implements ILessonService{
    constructor(private _lessonRepository:LessonRepository){}

    async addLesson(data: TLessonAdd,thumbnail:string): Promise<void> {
        await this._lessonRepository.addLesson(data,thumbnail)
    }

    async getLessons(courseId:string):Promise<TLessonModel[] |null>{
        return await this._lessonRepository.getLessons(courseId)
    }
}