import { Request, Response } from "express";
import { IFindAllUsersService } from "../../interfaces/serviceInterfaces/user/findAllUserService";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from "../../shared/constant";
import { CustomError } from "../../util/CustomError";


export class FindAllUsersController{
    constructor(private findAllUsersService:IFindAllUsersService){}


    async handle(req:Request,res:Response){
        try {
            const users = await this.findAllUsersService.findAllUsers();
              res.status(HTTP_STATUS.CREATED).json({
                    success: true,
                    message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
                    users
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