import { TLessonAdd, TLessonModel } from "../../types/course";

export interface ILessonRepository{
    addLesson(data:TLessonAdd,thumbnail:string):Promise<void>;
    getLessons(courseId:string):Promise<TLessonModel[] | null>
}