import { Request, Response } from "express";
import { IWalletService } from "../interfaces/serviceInterfaces/walletService";
import { CustomRequest } from "../middleware/authMiddleware";
import { CustomError } from "../util/CustomError";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";

export class WalletController {
  constructor(private _walletService: IWalletService) {}

  async walletDetails(req: Request, res: Response) {
    try {
      const user = (req as CustomRequest).user;
      if (!user || !user.userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({
            success: false,
            message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          });
        return;
      }

      let wallet = await this._walletService.walletDetails(user.userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        wallet,
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
