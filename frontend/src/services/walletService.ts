import { authAxiosInstance } from "@/api/authAxiosInstance";




export const walletService ={
    async getWalletData(){
        try {
            const resposne = await authAxiosInstance.get("/wallet/get-data");
            return resposne;
        } catch (error) {
            throw new Error("Failed to get Wallet Data")
        }
    }
}