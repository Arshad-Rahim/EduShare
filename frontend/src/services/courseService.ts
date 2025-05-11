import { authAxiosInstance } from "@/api/authAxiosInstance";
import { toast } from "sonner";

// Updated type to match CourseListingPage and make fields optional
type CourseParams = {
  search?: string;
  category?: string;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: string;
  limit?: string;
};

export type Lesson = {
  _id: string;
  title: string;
  description: string;
  duration?: number;
  order?: number;
  file?: string;
};

export type Course = {
  _id: string;
  title: string;
  tagline: string;
  category: string;
  difficulty: string;
  price: number;
  about: string;
  thumbnail?: string;
};

export const courseService = {
  async getCourseDetails(courseId: string) {
    try {
      const response = await authAxiosInstance.get(`/courses/all-courses`);
      const foundCourse = response.data.courses.courses.find(
        (c: Course) => c._id === courseId
      );
      if (!foundCourse) {
        throw new Error("Course not found");
      }
      return foundCourse;
    } catch (error) {
      console.error("Failed to fetch course details:", error);
      toast.error("Failed to load course details");
    }
  },

  async getLessons(courseId: string) {
    try {
      const response = await authAxiosInstance.get(
        `/lessons/course/${courseId}`
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
      toast.error("Failed to load lessons");
    }
  },

  async getSpecificTutorCourse(page: number, limit: number) {
    try {
      const response = await authAxiosInstance.get("/courses/my-courses", {
        params: {
          page,
          limit,
        },
      });
      return response;
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast.error("Failed to load courses");
    }
  },

  async deleteCourse(courseToDelete: string) {
    try {
      const response = await authAxiosInstance.delete(
        `/courses/delete/${courseToDelete}`
      );
      return response;
    } catch (error) {
      console.error("Failed to delete course:", error);
      toast.error("Failed to delete course");
    }
  },

  async deleteLesson(lessonToDelete: string) {
    try {
      const response = await authAxiosInstance.delete(
        `/lessons/delete/${lessonToDelete}`
      );
      return response;
    } catch (error) {
      console.error("Failed to delete lesson:", error);
      toast.error("Failed to delete lesson");
      throw error;
    }
  },

  async getAllCourse(params?: CourseParams) {
    try {
      if (params) {
        // Create URLSearchParams to properly serialize query parameters
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
        const response = await authAxiosInstance.get(
          `/courses/all-courses?${queryParams.toString()}`
        );
        return response;
      } else {
        const response = await authAxiosInstance.get(`/courses/all-courses`);
        return response;
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast.error("Failed to load courses");
      throw error;
    }
  },

  async checkCoursePurchase(courseId: string) {
    try {
      const response = await authAxiosInstance.get(
        `/courses/${courseId}/purchase-status`
      );
      return response.data.purchaseStatus;
    } catch (error) {
      throw new Error("Failed to check purchase status");
    }
  },

  async getEnrolledCourses() {
    try {
      const response = await authAxiosInstance.get("/courses/enrolled-courses");
      return response.data.courses;
    } catch (error) {
      throw new Error("Failed to get purchased courses");
    }
  },

  async getCompletedLessons(courseId: string) {
    try {
      const response = await authAxiosInstance.get(
        `/progress/${courseId}/completed-lessons`
      );
      return response.data.lessons;
    } catch (error) {
      throw new Error("Failed to get completed lesson");
    }
  },

  async markLessonCompleted(lessonId: string, courseId: string) {
    try {
      const response = await authAxiosInstance.post(
        `/progress/${lessonId}/complete`,
        { courseId }
      );
      return response;
    } catch (error) {
      throw new Error("Failed to mark lesson as completed");
    }
  },

  async getAllCourses(page: number, limit: number) {
    try {
      const response = await authAxiosInstance.get("/courses/all-courses", {
        params: { page, limit },
      });
      return response;
    } catch (error) {
      throw new Error("Failed to get all courses");
    }
  },

  async editLesson(lessonId: string, formData: FormData) {
    try {
      const response = await authAxiosInstance.put(
        `/lessons/${lessonId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response;
    } catch (error) {
      throw new Error("Failed to Edit Lesson");
    }
  },

  async editCourse(courseId: string, formData: FormData) {
    try {
      const response = await authAxiosInstance.put(
        `/courses/update/${courseId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response;
    } catch (error) {
      throw new Error("Failed to edit Courses");
    }
  },

  async addCourse(formData: FormData) {
    try {
      const response = await authAxiosInstance.post("/courses/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response;
    } catch (error) {
      throw new Error("Failed to add new course");
    }
  },

  async courseCount() {
    try {
      const response = await authAxiosInstance.get("/courses/course-count");
      return response;
    } catch (error) {
      throw new Error("Failed to get course count");
    }
  },
};
