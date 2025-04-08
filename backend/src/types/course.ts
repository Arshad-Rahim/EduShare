import { Types } from "mongoose";

// export type TCourseAdd = {
//   title: Types.ObjectId;
//   tagline:string;
//   category:string;
//   difficulty:string;
//   price:number;
//   about:string;
//   thumbnail:string;
//   tutorId:string;
// };


export type TCourseAdd = {
  title: string;
  tagline: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced"; // Updated to match schema
  price: number; // Matches schema (string in DB)
  about: string;
  thumbnail: string;
  tutorId: Types.ObjectId; // Matches schema (ObjectId in DB)
  enrollments?: number; // Optional for sorting
  createdAt?: Date; // Optional for sorting
  _id?: Types.ObjectId; // Optional MongoDB ID
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

  export type IUpdateData = {
    title: string;
    tagline: string;
    category: string;
    difficulty: string;
    price: number;
    about: string;
    thumbnail?:string;
  };


 export type FilterQuery = {
    $or?: { [key: string]: { $regex: string; $options: string } }[];
    category?: { $in: string[] };
    difficulty?: { $in: string[] };
    price?: { $gte?: number; $lte?: number };
  };

 export type SortOption = Record<string, 1 | -1>;