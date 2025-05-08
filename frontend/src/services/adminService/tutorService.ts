import { authAxiosInstance } from "@/api/adminAxiosInstance";

export const tutorService = {
  async userList(
    currentPage: number,
    rowsPerPage: number,
    searchQuery: string
  ) {
    try {
      const response = await authAxiosInstance.get("/admin/usersList", {
        params: {
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery,
          role: "tutor",
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async blockTutor(tutorId: string, newBlocked: boolean) {
    try {
      await authAxiosInstance.patch(`/admin/${tutorId}/status`, {
        status: newBlocked,
      });
    } catch (error) {
      throw error;
    }
  },

  async tutorApproval(tutorToApprove: string) {
    try {
      await authAxiosInstance.patch(`admin/${tutorToApprove}/approve`);
    } catch (error) {
      throw error;
    }
  },

  async tutorReject(tutorToReject: string, rejectionReason: string) {
    try {
      await authAxiosInstance.patch(`admin/${tutorToReject}/reject`, {
        reason: rejectionReason,
      });
    } catch (error) {
      throw error;
    }
  },

  async trendingTutors() {
    try {
      const response = await authAxiosInstance.get("/tutors/trending");
      return response;
    } catch (error) {
      throw new Error("Failed to get trending tutors");
    }
  },
};
