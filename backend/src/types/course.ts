import { Types } from "mongoose";

export type TCourseAdd = {
  title: string;
  tagline:string;
  category:string;
  difficulty:string;
  price:string;
  about:string;
  thumbnail:string;
};

export type TLessonAdd = {
  title:string;
  courseId:string;
  description:string;
  file:string;
  duration ?:number;
};
export type TLessonModel = {
  title: string;
  courseId: Types.ObjectId;
  description: string;
  file: string;
  duration?: number;
  _id: Types.ObjectId;
};