import { Request, Response } from "express";
import { ILoginUserService } from "../../interfaces/serviceInterfaces/user/loginUserService";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../../shared/constant";
import { CustomError } from "../../util/CustomError";
import { Secret } from "jsonwebtoken";

export class LoginUserController {
  constructor(private loginUserService: ILoginUserService) {}

  async loginUser(req: Request, res: Response) {
    try {
      const data = req.body;
      const jwt = require("jsonwebtoken");

      const user = await this.loginUserService.loginUser(data);
      const token = jwt.sign(
        { id: user?._id },
        process.env.JWT_SECRET as Secret,
        {
          expiresIn: "1h",
        }
      );

      res.cookie(`${data.role}AccessToken`, token, {
        httpOnly: true, // Prevents JavaScript access
        sameSite: "strict", // CSRF protection
        maxAge: 3600000, // 1 hour in milliseconds
      });

      res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        user: { id: user?._id, username: user?.name },
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
