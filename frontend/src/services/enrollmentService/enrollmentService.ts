import { authAxiosInstance } from "@/api/authAxiosInstance";

export const enrollmentService = {
  async checkEnrollmentStatus(courseId: string) {
    try {
      const response = await authAxiosInstance.get(
        `/enrollments/check/${courseId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};
