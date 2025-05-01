import { TransactionController } from "../controller/transactionController";
import { TransactionRepository } from "../repository/transactionRepository";
import { TransactionService } from "../service/transactionService";


const transactionRepository = new TransactionRepository();

const transactionService = new TransactionService(transactionRepository);


export const injectedTransactionController=new TransactionController(transactionService)