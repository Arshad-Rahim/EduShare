import { authAxiosInstance } from "@/api/adminAxiosInstance";
import { LoginFormData } from "@/validation";

export const adminService = {
  async loginAdmin(data: LoginFormData) {
    try {
      const response = await authAxiosInstance.post("/auth/login", {
        ...data,
        role: "admin",
      });

      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  async logoutAdmin() {
    try {
      const response = await authAxiosInstance.post("/admin/logout");
      return response;
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  },
};
