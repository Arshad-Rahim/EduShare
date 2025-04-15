import { authAxiosInstance } from "@/api/adminAxiosInstance";

export const userService = {
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
          role: "user",
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  },

  async blockUser(userId: string, newBlocked: boolean) {
    await authAxiosInstance.patch(`/admin/${userId}/status`, {
      status: newBlocked,
    });
  },
};
