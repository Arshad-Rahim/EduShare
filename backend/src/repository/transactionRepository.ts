import { ITransactionRepository } from "../interfaces/repositoryInterfaces/ITransactionRepository";
import { TransactionModel } from "../models/transactionModel";
import { TTransaction } from "../types/transaction";

export class TransactionRepository implements ITransactionRepository {
  async transactionDetails(
    walletId: string,
    page: number,
    limit: number
  ): Promise<{ transactions: TTransaction[]|null; totalTransaction:number }> {
      const transactions = await TransactionModel.find({ wallet_id: walletId })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ transaction_date: -1 })
        .populate("purchase_id", "orderId");

      const totalTransaction = await TransactionModel.countDocuments({
        wallet_id: walletId,
      });

      return {transactions : transactions as TTransaction[] ,totalTransaction} ;
  }
}
