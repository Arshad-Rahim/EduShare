import { ICourseRepository } from "../interfaces/repositoryInterfaces/ICourseRepository";
import { courseModel } from "../models/courseModel";
import { lessonModel } from "../models/lessonModel";
import { purchaseModel } from "../models/purchaseModel";
import {
  CoursePurchaseCount,
  FilterQuery,
  IUpdateData,
  SortOption,
  TCourseAdd,
} from "../types/course";
import { TCourseFilterOptions } from "../types/user";

export class CourseRepository implements ICourseRepository {
  async addCourse(
    data: TCourseAdd,
    thumbnail: string,
    tutorId: string
  ): Promise<void> {
    await courseModel.create({
      title: data.title,
      tagline: data.tagline,
      category: data.category,
      difficulty: data.difficulty,
      price: data.price,
      about: data.about,
      thumbnail: thumbnail,
      tutorId: tutorId,
    });
  }

  async getTutorCourses(
    tutorId: string,
    page: number,
    limit: number
  ): Promise<{ courses: TCourseAdd[] | null; totalCourses: number }> {
    const courses = await courseModel
      .find({ tutorId })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCourses = await courseModel.countDocuments({ tutorId });

    return { courses, totalCourses };
  }

  async editCourse(
    data: TCourseAdd,
    thumbnail: string,
    courseId: string
  ): Promise<void> {
    const updateData: IUpdateData = {
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
    await lessonModel.deleteMany({ courseId });
  }

  async getAllCourses(
    options: TCourseFilterOptions
  ): Promise<{ courses: TCourseAdd[]; total: number }> {
    try {
      console.log("OPTIONS THAT GET",options)
      const {
        page,
        limit,
        search,
        category,
        difficulty,
        minPrice,
        maxPrice,
        sort,
      } = options;

      console.log("SEARCH",search)

      // Calculate skip for pagination
      const skip = (page - 1) * limit;

      // Build filter object
      const filters: FilterQuery = {};

      if (search) {
        filters.$or = [
          { title: { $regex: search, $options: "i" } }, // Case-insensitive search
          { tagline: { $regex: search, $options: "i" } },
          { about: { $regex: search, $options: "i" } },
        ];
      }

      if (category) {
        const categories = category.split(",");
        filters.category = { $in: categories }; // Match any of the selected categories
      }

      if (difficulty) {
        const difficulties = difficulty.split(",");
        filters.difficulty = { $in: difficulties }; // Match any of the selected difficulties
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        filters.price = {};
        if (minPrice !== undefined) filters.price.$gte = minPrice;
        if (maxPrice !== undefined) filters.price.$lte = maxPrice;
      }

      // Build sort object
      let sortOption: SortOption = {};
      switch (sort) {
        case "popular":
          sortOption = { enrollments: -1 }; // Assuming enrollments field exists
          break;
        case "newest":
          sortOption = { createdAt: -1 };
          break;
        case "price-low":
          sortOption = { price: 1 };
          break;
        case "price-high":
          sortOption = { price: -1 };
          break;
        default:
          sortOption = { enrollments: -1 }; // Default to popular
      }
      // Fetch filtered and paginated courses

      const courses = await courseModel
        .find(filters)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(); // Optional: lean() for better performance by returning plain JS objects

      // Get total count of matching documents
      const total = await courseModel.countDocuments(filters);
      console.log("COURSES THAT AFTER FILTER",courses)
      return { courses, total };
    } catch (error) {
      console.error("Error fetching courses:", error);
      return { courses: [], total: 0 };
      // Return null on error as per the original return type
    }
  }

  async purchaseStatus(userId: string, courseId: string): Promise<boolean> {
    const purchased = await purchaseModel.findOne({
      userId,
      "purchase.courseId": courseId,
      "purchase.status": "succeeded",
    });
    return !!purchased; // Return true if a matching document is found, false otherwise
  }

  async getEnrolledCourses(userId: string): Promise<TCourseAdd[]> {
    try {
      const purchases = await purchaseModel
        .find({ userId, "purchase.status": "succeeded" })
        .lean();
      const courseIds = purchases
        .flatMap((purchase) =>
          purchase.purchase
            .filter((item) => item.status === "succeeded")
            .map((item) => item.courseId.toString())
        )
        .filter((courseId): courseId is string => !!courseId);
      const courses = await courseModel
        .find({ _id: { $in: courseIds } })
        .lean();
      const enrolledCourses: TCourseAdd[] = courses.map((course) => ({
        _id: course._id,
        title: course.title,
        tagline: course.tagline,
        category: course.category,
        difficulty: course.difficulty,
        price: course.price,
        about: course.about,
        thumbnail: course.thumbnail,
        tutorId: course.tutorId,
        enrolledCourses: course.enrollments,
      }));
      return enrolledCourses;
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      return [];
    }
  }

  async getCourseDetails(courseId: string): Promise<TCourseAdd | null> {
    const course = await courseModel.findById(courseId);
    return course;
  }

  async getCourseTotalCount(): Promise<number> {
    const courseCount = await courseModel.countDocuments();
    return courseCount;
  }

                        async coursePurchaseCount(): Promise<CoursePurchaseCount[]> {
                          const allCourses = await courseModel.find().lean();

                          const coursePurchaseCounts: CoursePurchaseCount[] = allCourses.map(
                            (course) => ({
                              courseId: course._id.toString(),
                              courseName: course.title,
                              purchaseCount: Array.isArray(course.enrollments)
                                ? course.enrollments.length
                                : 0,
                            })
                          );

                          coursePurchaseCounts.sort((a, b) => b.purchaseCount - a.purchaseCount);
                          return coursePurchaseCounts;
                        }
}
