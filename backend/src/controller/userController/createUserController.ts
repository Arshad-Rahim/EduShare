import { Request, Response } from "express";
import { RegisterDTO } from "../../validation/userValidation";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from "../../shared/constant";
import { CustomError } from "../../util/CustomError";
import { ICreateUserService } from "../../interfaces/serviceInterfaces/user/createUserService";


export class CreateUserController{
    constructor(private createUserService:ICreateUserService){}

      async handle(req: Request, res: Response) {
        try {
          const data: RegisterDTO = req.body;
    
          await this.createUserService.createUser(data);
    
          res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
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