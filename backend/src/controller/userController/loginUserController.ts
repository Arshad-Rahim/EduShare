import { Request, Response } from "express";
import { ILoginUserService } from "../../interfaces/serviceInterfaces/user/loginUserService";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../../shared/constant";
import { CustomError } from "../../util/CustomError";
import { ITokenService } from "../../interfaces/tokenServiceInterface";

export class LoginUserController {
  constructor(
    private loginUserService: ILoginUserService,
    private jwtService: ITokenService
  ) {}

  async loginUser(req: Request, res: Response) {
    try {
      const data = req.body;

      const user = await this.loginUserService.loginUser(data);

      // if (user?.isAccepted == false && user?.role == "tutor") {
      //   res.status(HTTP_STATUS.UNAUTHORIZED).json({
      //     success: false,
      //     message: ERROR_MESSAGES.ADMIN_DONOT_ACCEPTED,
      //   });
      //   return;
      // }

      const accessToken = this.jwtService.generateAccessToken({
        id: user?._id?.toString()!,
        email: user?.email!,
        role: user?.role!,
      });
      const refreshToken = this.jwtService.generateRefreshToken({
        id: user?._id?.toString()!,
        email: user?.email!,
        role: user?.role!,
      });

      res.cookie(`${data.role}AccessToken`, accessToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });

      res.cookie(`${data.role}RefreshToken`, refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
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
