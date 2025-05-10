import { authAxiosInstance } from "@/api/authAxiosInstance";
import { toast } from "sonner";

type Params = {
  userId?: string;
  page: number;
  limit: number;
};

export const wishlistService = {
  async getWishlist(params: Params) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        ...(params.userId && { userId: params.userId }),
      });
      const response = await authAxiosInstance.get(`/wishlist?${queryParams}`);
      return response;
    } catch (error) {
      console.error("Failed to fetch wishlist courses:", error);
      toast.error("Failed to load wishlist");
    }
  },

  async removeFromWishlist(courseId: string) {
    try {
      await authAxiosInstance.delete(`/wishlist/${courseId}`);
    } catch (error) {
      console.error("Failed to remove course from wishlist:", error);
      toast.error("Failed to remove course from wishlist");
    }
  },

  async addToWishlist(courseId: string) {
    try {
      const response = await authAxiosInstance.post(`/wishlist/${courseId}`);
      return response;
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  },
};