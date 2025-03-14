import { Request, Response } from "express";
import { TUserRegister } from "../types/user";
import { IUserService } from "../interfaces/serviceInterfaces/userServiceInterface";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from "../shared/constant";
import { CustomError } from "../util/CustomError";

export class UserController {
  constructor(private userService: IUserService) {}

  async createUser(req: Request, res: Response) {
    try {
      const data: TUserRegister = req.body;

      await this.userService.createUser(data);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      console.log(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async verifyOtpToRegister(req: Request, res: Response) {
    try {
      const data = req.body;

      await this.userService.verifyOtpToRegister(data);
      res.status(HTTP_STATUS.OK).json({ message: SUCCESS_MESSAGES.VERIFICATION_SUCCESS });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.log(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }
}
