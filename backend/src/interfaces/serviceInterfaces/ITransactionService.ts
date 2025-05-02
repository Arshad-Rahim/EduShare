import { TTransaction } from "../../types/transaction";

export interface ITransactionService {
  transactionDetails(
    wallet: string,
    page: number,
    limit: number
  ): Promise<{ transactions: TTransaction[] | null; totalTransaction: number }>;
}