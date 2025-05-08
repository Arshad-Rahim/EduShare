import { authAxiosInstance } from "@/api/authAxiosInstance";

export const purchaseService = {
 async coursePurchaseCount(){
    try {
        const response = await authAxiosInstance.get("/courses/purchase-count");
        return response;
    } catch (error) {
        throw new Error("Failed to get the coursePurchaseCount");
    }
 }
};