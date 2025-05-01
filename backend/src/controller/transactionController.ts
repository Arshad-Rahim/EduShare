import { Request, Response } from "express";
import { ITransactionService } from "../interfaces/serviceInterfaces/ITransactionService";
import { CustomError } from "../util/CustomError";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from "../shared/constant";

export class TransactionController {
  constructor(private _transactionService: ITransactionService) {}

  async transactionDetails(req: Request, res: Response) {
    try {
      const { walletId } = req.query;

      if (!walletId || typeof walletId !== "string") {
         res.status(400).json({ error: "walletId is required" });
         return;
      }

      const transactions = await this._transactionService.transactionDetails(walletId);
       res.status(HTTP_STATUS.OK).json({
              success: true,
              message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
              transactions
            });
    } catch (error) {
      if (error instanceof CustomError) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
        return;
      }
      console.log(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }
}
