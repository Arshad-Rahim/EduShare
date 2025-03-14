import { Request, Response } from "express";
import { ILoginUserService } from "../../interfaces/serviceInterfaces/user/loginUserService";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from "../../shared/constant";
import { CustomError } from "../../util/CustomError";



export class LoginUserController {
  constructor(private loginUserService: ILoginUserService) {}

  async loginUser(req: Request, res: Response) {
    try {
      const data = req.body;

      await this.loginUserService.loginUser(data);
      res
        .status(HTTP_STATUS.OK)
        .json({ message: SUCCESS_MESSAGES.LOGIN_SUCCESS });
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