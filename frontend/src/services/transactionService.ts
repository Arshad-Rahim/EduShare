import { authAxiosInstance } from "@/api/authAxiosInstance";

interface Filters {
  courseName?: string;
  startDate?: string;
  endDate?: string;
}

interface Wallet {
  _id: string;
}

interface WalletResponse {
  data: {
    wallet: Wallet;
  };
}

export const transactionService = {
  async getTransactions(
    walletResponse: WalletResponse,
    currentPage: number,
    rowsPerPage: number,
    filters: Filters = {}
  ) {
    try {
      const { courseName = "", startDate = "", endDate = "" } = filters;

      const params = new URLSearchParams();
      params.append("walletId", walletResponse.data.wallet._id);
      params.append("page", currentPage.toString());
      params.append("limit", rowsPerPage.toString());
      if (courseName) params.append("courseName", courseName);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await authAxiosInstance.get(
        `/transaction/transaction-details?${params.toString()}`
      );
      return response;
    } catch (error) {
      throw new Error("Failed to get Transactions");
    }
  },
};
