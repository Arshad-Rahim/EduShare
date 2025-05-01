import { ITransactionRepository } from "../interfaces/repositoryInterfaces/ITransactionRepository";
import { ITransactionService } from "../interfaces/serviceInterfaces/ITransactionService";
import { TTransaction } from "../types/transaction";

export class TransactionService implements ITransactionService{
    constructor(private _transactionRepository:ITransactionRepository){}
    async transactionDetails(walletId: string): Promise<TTransaction[] | null> {
        return await this._transactionRepository.transactionDetails(walletId)
    }
}