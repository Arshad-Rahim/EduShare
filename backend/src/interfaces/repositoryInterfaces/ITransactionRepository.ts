import { TTransaction } from "../../types/transaction";

export interface ITransactionRepository{
    transactionDetails(userId:string):Promise<TTransaction[] | null>
}