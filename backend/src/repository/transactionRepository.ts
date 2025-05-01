import { ITransactionRepository } from "../interfaces/repositoryInterfaces/ITransactionRepository";
import { TransactionModel } from "../models/transactionModel";
import { TTransaction } from "../types/transaction";

export class TransactionRepository implements ITransactionRepository {
  async transactionDetails(walletId: string): Promise<TTransaction[] | null> {
    try {
      const transactions = await TransactionModel.find({ wallet_id: walletId })
        .sort({ transaction_date: -1 })
        .populate("purchase_id", "orderId");
      return (transactions as TTransaction[]) || null;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return null;
    }
  }
}