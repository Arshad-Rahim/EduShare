import { TTransaction } from "../../types/transaction";

export interface ITransactionService{
    transactionDetails(walletId: string): Promise<TTransaction[] | null>
}