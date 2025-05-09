import { Request, Response } from "express";
import { IPurchaseService } from "../interfaces/serviceInterfaces/IPurchaseService";
import { CustomError } from "../util/CustomError";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";
import { CustomRequest } from "../middleware/authMiddleware";

export class PurchaseController {
  constructor(private _purchaseService: IPurchaseService) {}

  async saveOrder(req: Request, res: Response) {
    try {
      console.log("ivde varunnunto");
      const user = (req as CustomRequest).user;
      const data = req.body;
      console.log("DATA IN BACKEND", data);
      await this._purchaseService.saveOrder(user?.userId, data);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATED,
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


  async allPurchase(req:Request,res:Response){
    try {
      const purchases = await this._purchaseService.allPurchase();
       res.status(HTTP_STATUS.OK).json({
         success: true,
         message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
         purchases,
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
