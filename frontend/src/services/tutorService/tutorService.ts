import { authAxiosInstance } from "@/api/authAxiosInstance";
import { toast } from "sonner";

export const tutorService = {
  async tutorDetails() {
    try {
      const response = authAxiosInstance.get("/tutors/me");
      return response;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      throw error;
    }
  },

  async fetchNotification() {
    try {
      const response = await authAxiosInstance.get("/tutors/notifications");
      return response;
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Could not load notifications");
    }
  },

  async markNotifiactionAsRead(notificationId: string) {
    try {
      await authAxiosInstance.put(
        `/tutors/notifications/${notificationId}/read`
      );
    } catch (error) {
      console.log(error);
    }
  },

  async markAllNotificationAsRead() {
    try {
      await authAxiosInstance.put("/tutors/notifications/read-all");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to update notifications");
    }
  },
  async logoutTutor() {
    try {
      const response = await authAxiosInstance.post("/auth/logout");
      return response;
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to sign out");
    }
  },

  async fetchPrivateChats() {
    try {
      const response = await authAxiosInstance.get("/tutors/private-chat");
      return response;
    } catch (error) {
      console.error("Failed to fetch chat:", error);
      toast.error("Failed to fetch chat");
    }
  },

  async profileUpdate(formData) {
    try {
      const response = await authAxiosInstance.post(
        "/tutors/profileUpdate",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response;
    } catch (error) {
      throw new Error("Failed to Update the profile");
    }
  },

  async getStudentDetails(userId) {
    try {
      const response = await authAxiosInstance.get(`/users/${userId}`);
      return response;
    } catch (error) {
      console.error("Failed to fetch userDetails:", error);
      toast.error("Failed to fetch userDetails");
    }
  },


};
