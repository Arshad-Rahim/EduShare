import { Request, Response } from "express";
import { IAuthService } from "../interfaces/serviceInterfaces/authService";
import { RegisterDTO } from "../validation/userValidation";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";
import { CustomError } from "../util/CustomError";
import { ITokenService } from "../interfaces/tokenServiceInterface";

export class AuthController {
  constructor(
    private _authService: IAuthService,
    private _jwtService: ITokenService
  ) {}

  async registerUser(req: Request, res: Response) {
    try {
      let data: RegisterDTO = req.body;

      console.log("Data", data);
      if (data.role == "tutor") {
        data = {
          ...data,
          isAccepted: false,
        };
      }
      console.log("Datab After", data);

      await this._authService.registerUser(data);

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

  async loginUser(req: Request, res: Response) {
    try {
      const data = req.body;

      const user = await this._authService.loginUser(data);

      if (!user || !user._id || !user.email || !user.role) {
        throw new Error("User data is missing or incomplete");
      }

      const accessToken = this._jwtService.generateAccessToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });
      const refreshToken = this._jwtService.generateRefreshToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
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

  async resetPassword(req: Request, res: Response) {
    try {
      const data = req.body;
      await this._authService.resetPassword(data);
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

  async verifyEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;

      await this._authService.verifyEmail(email);
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
