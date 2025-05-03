import { authAxiosInstance } from "@/api/authAxiosInstance";



export const transactionService = {
  async getTransactions(walletResponse, currentPage, rowsPerPage) {
    try {
      const response = await authAxiosInstance.get(
        `/transaction/transaction-details?walletId=${walletResponse.data.wallet._id}&page=${currentPage}&limit=${rowsPerPage}`
      );
      return response;
    } catch (error) {
      throw new Error("Failed to get Transactions");
    }
  },
};