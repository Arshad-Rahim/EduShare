import { authAxiosInstance } from "@/api/authAxiosInstance";
import { toast } from "sonner";

export const wishlistService ={
    async getWishlist(params){
        try {
             const response = await authAxiosInstance.get(
                    `/wishlist?${params.toString()}`
                  );
                  return response;

        } catch (error) {
              console.error("Failed to fetch wishlist courses:", error);
              toast.error("Failed to load wishlist");
        }
    },

    async removeFromWishlist(courseId){
        try {
            await authAxiosInstance.delete(`/wishlist/${courseId}`);
        } catch (error) {
             console.error("Failed to remove course from wishlist:", error);
                  toast.error("Failed to remove course from wishlist");
        }
    },

    async addToWishlist(courseId){
        try {
              const response = await authAxiosInstance.post(`/wishlist/${courseId}`);
              return response;
        } catch (error) {
            console.error("Failed to toggle wishlist:", error);
                  toast.error(error.response?.data?.message || "Failed to update wishlist");
        }
    }
}