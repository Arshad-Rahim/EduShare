import { authAxiosInstance } from "@/api/authAxiosInstance";
import { toast } from "sonner";

export const profileService = {
  async userDetails() {
    try {
      const response = await authAxiosInstance.get("/users/me");
      return response;
    } catch (error) {
      throw error;
    }
  },

  async profileUpdate(data: ProfileUpdate) {
    try {
      const response = authAxiosInstance.post("/users/profileUpdate", data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getUserById(userId: string) {
    try {
      const response = await authAxiosInstance.get(`/users/${userId}`);
      return response;
    } catch (error) {
      console.error("Failed to fetch user by ID:", error);
      toast.error("Failed to load user details");
      throw error;
    }
  },
};

export type ProfileUpdate = {
  name?: string;
  email?: string;
  bio?: string;
  interests?: string;
  education?: string;
  password?: string;
};
