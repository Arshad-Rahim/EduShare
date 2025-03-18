import { Request, Response } from "express";
import { IResetPasswordService } from "../../interfaces/serviceInterfaces/user/resetPasswordService";
import { CustomError } from "../../util/CustomError";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../../shared/constant";

export class ResetPasswordController {
  constructor(private forgetPasswordService: IResetPasswordService) {}

  async resetPassword(req: Request, res: Response) {
    try {
      const data = req.body;
      await this.forgetPasswordService.resetPassword(data);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
      });
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
