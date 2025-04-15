import { authAxiosInstance } from "@/api/authAxiosInstance";

export const profileService = {
  async userDetails() {
    try {
      const response = await authAxiosInstance.get("/users/me");
      return response;
    } catch (error) {
      throw error;
    }
  },

  async profileUpdate(data) {
    try {
      const response = authAxiosInstance.post("/users/profileUpdate", data);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
