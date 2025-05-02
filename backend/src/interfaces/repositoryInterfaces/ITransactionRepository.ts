import { TTransaction } from "../../types/transaction";

export interface ITransactionRepository {
  transactionDetails(
    walletId: string,
    page: number,
    limit: number
  ): Promise<{ transactions: TTransaction[] | null; totalTransaction: number }>;
}