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

  async getSpecificTutorCourse(page, limit) {
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

  async deleteCourse(courseToDelete) {
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

  async deleteLesson(lessonToDelete) {
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

  async getAllCourse(params) {
    try {
      const response = await authAxiosInstance.get(
        `/courses/all-courses?${params.toString()}`
      );
      return response;
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
      const resposne = await authAxiosInstance.get("/courses/enrolled-courses");
      return resposne.data.courses;
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
      throw new Error("Failed to marks lesson as completed");
    }
  },

  async getAllCourses(page,limit){
    try {
      const response = await authAxiosInstance.get("/courses/all-courses", {
        params: { page, limit }, 
      });
      return response;
      
    } catch (error) {
       throw new Error("Failed to get all courses");
    }
  },


  async editLesson(selectedLesson,formData){
    try {
      const resposne = await authAxiosInstance.put(
        `/lessons/${selectedLesson._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return resposne;

    } catch (error) {
      throw new Error("Failed to Edit Lesson")
    }
    
  },


  async editCourse(course,formData){
    try {
       const response = await authAxiosInstance.put(
         `/courses/update/${course._id}`,
         formData,
         {
           headers: { "Content-Type": "multipart/form-data" },
         }
       );
       return response;
    } catch (error) {
      throw new Error("Failed to edit Courses")
    }
    
  },

  async addCourse(formData){
    try {
       const resposne = await authAxiosInstance.post("/courses/add", formData, {
         headers: { "Content-Type": "multipart/form-data" },
       });
       return resposne;
    } catch (error) {
      throw new Error("Failed to add new course")
    }
 
  },


  async courseCount(){
    try {
      const resposne = await  authAxiosInstance.get("/courses/course-count");
      return resposne;
    } catch (error) {
      throw new Error("Failed to get course count")
    }
  }

};
