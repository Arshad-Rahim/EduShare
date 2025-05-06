import { TTransaction } from "../../types/transaction";

export interface ITransactionRepository {
  transactionDetails(
    walletId: string,
    page: number,
    limit: number,
    filters: {
      courseName?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{
    transactions: TTransaction[] | null;
    totalTransaction: number;
  }>;
}
