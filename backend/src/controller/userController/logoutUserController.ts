import { Request, Response } from "express";
import { CustomError } from "../../util/CustomError";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constant";

export class LogoutUserController {
  constructor() {}

  async logoutUser(req: Request, res: Response) {
    try {
      res.clearCookie("userAccessToken");
        res
          .clearCookie("tutorAccessToken")
          .status(200)
          .json({ message: "Logout successful" });
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
