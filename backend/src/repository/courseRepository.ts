import { ICourseRepository } from "../interfaces/repositoryInterfaces/ICourseRepository";
import { courseModel } from "../models/courseModel";
import { TCourseAdd } from "../types/course";

export class CourseRepository implements ICourseRepository {
  async addCourse(data: TCourseAdd, thumbnail: string): Promise<void> {
    await courseModel.create({
      title: data.title,
      tagline: data.tagline,
      category: data.category,
      difficulty: data.difficulty,
      price: data.price,
      about: data.about,
      thumbnail: thumbnail,
    });
  }

  async getAllCourses(): Promise<TCourseAdd[] | null> {
    const courses = await courseModel.find();
    return courses;
  }

  async editCourse(
    data: TCourseAdd,
    thumbnail: string,
    courseId: string
  ): Promise<void> {
    const updateData: any = {
      title: data.title,
      tagline: data.tagline,
      category: data.category,
      difficulty: data.difficulty,
      price: data.price,
      about: data.about,
    };

    // Only add `thumbnail` if it's not an empty string
    if (thumbnail.trim() !== "") {
      updateData.thumbnail = thumbnail;
    }

    await courseModel.findByIdAndUpdate(courseId, updateData);
  }
  async deleteCourse(courseId: string): Promise<void> {
    await courseModel.findByIdAndDelete({ _id: courseId });
  }
}
