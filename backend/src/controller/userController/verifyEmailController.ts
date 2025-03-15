import { Request, Response } from "express";
import { IVerifyEmailUserService } from "../../interfaces/serviceInterfaces/user/verifyEmailUserService";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from "../../shared/constant";
import { CustomError } from "../../util/CustomError";

export class VerifyEmailController {
  constructor(private verifyEmailUserService: IVerifyEmailUserService) {}

  async verifyEmail(req: Request, res: Response) {
    try {
      const {email} = req.body;

      await this.verifyEmailUserService.verifyEmail(email);
      res
        .status(HTTP_STATUS.OK)
        .json({ message: SUCCESS_MESSAGES.VERIFICATION_SUCCESS });
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
