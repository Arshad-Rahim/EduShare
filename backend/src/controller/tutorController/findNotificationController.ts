import { Request, Response } from "express";
import { IFindNotificationService } from "../../interfaces/serviceInterfaces/tutor/findNotificationService";
import { CustomError } from "../../util/CustomError";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from "../../shared/constant";
import { CustomRequest } from "../../middleware/userAuthMiddleware";



export class FindNotificationController{
    constructor(private findNotificationService:IFindNotificationService){}

    async handler(req:Request,res:Response){
        try {
                  const user = (req as CustomRequest).user;
                  const {userId} = user;
            const notifications =  await this.findNotificationService.findNotifications(userId);
          

             res.status(HTTP_STATUS.CREATED).json({
                    success: true,
                    message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
                    notifications
                  });
            
        } catch (error) {
            if (error instanceof CustomError) {
                    res.status(error.statusCode).json({
                      successs: false,
                      message: error.message,
                    });
                    return;
                  }
                  console.log(error);
                  res
                    .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                    .json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
        }
    }
}