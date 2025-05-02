import { Request, Response } from "express";
import { CustomRequest } from "../middleware/authMiddleware";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";
import {
  clearAuthCookies,
  updateCookieWithAccessToken,
} from "../util/cookieHelper";
import { IRefreshTokenService } from "../interfaces/serviceInterfaces/refreshTokenService";

export class RefreshTokenController {
  constructor(
    private _refreshTokenService: IRefreshTokenService,
  ) {}
  async handle(req: Request, res: Response): Promise<void> {
    try {

      const token =
        req.cookies.userRefreshToken ||
        req.cookies.adminRefreshToken ||
        req.cookies.tutorRefreshToken;


        console.log('inside refresh token controller======>')
      
      const newTokens = this._refreshTokenService.execute(
        token 
      );
      const accessTokenName = `${newTokens.role}AccessToken`;
      updateCookieWithAccessToken(res, newTokens.accessToken, accessTokenName);
      res
        .status(HTTP_STATUS.OK)
        .json({ success: true, message: SUCCESS_MESSAGES.OPERATION_SUCCESS });
    } catch (error) {
      clearAuthCookies(
        res,
        `${(req as CustomRequest).user?.role}AccessToken`,
        `${(req as CustomRequest).user?.role}RefreshToken`
      );
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.INVALID_TOKEN });

      console.error(error);

    }
  }
}
