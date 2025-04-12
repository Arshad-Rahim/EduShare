import { authAxiosInstance } from "@/api/authAxiosInstance";
import { toast } from "sonner";

export const courseService = {
  async getCourseDetails(courseId: string) {
    try {
      const response = await authAxiosInstance.get(`/courses/all-courses`);
      const foundCourse = response.data.courses.courses.find(
        (c) => c._id === courseId
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

  async getLessons(courseId) {
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


  async getSpecificTutorCourse(page,limit){
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


  async deleteCourse(courseToDelete){
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


  async deleteLesson(lessonToDelete){
    try {
      const response = await authAxiosInstance.delete(
        `/lessons/delete/${lessonToDelete}`
      );

      return response;
    } catch (error) {
       console.error("Failed to delete lesson:", error);
            toast.error("Failed to delete lesson");
    }
  },


  async getAllCourse(){
    try {
       const response = await authAxiosInstance.get("/courses/all-courses");
       return response;
    } catch (error) {
       console.error("Failed to fetch courses:", error);
            toast.error("Failed to load courses");
    }
  },

  async checkCoursePurchase(courseId) {
  try {
    const response = await authAxiosInstance.get(
      `/courses/${courseId}/purchase-status`
    );
    return response.data.purchaseStatus;
  } catch (error) {
    throw new Error("Failed to check purchase status");
  }
}

  
};
