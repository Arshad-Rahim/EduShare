import { Request, response, Response } from "express";
import { IRefreshTokenService } from "../../interfaces/serviceInterfaces/user/refreshTokenService";
import { CustomRequest } from "../../middleware/userAuthMiddleware";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../../shared/constant";
import {
  clearAuthCookies,
  updateCookieWithAccessToken,
} from "../../util/cookieHelper";
import { ITokenService } from "../../interfaces/tokenServiceInterface";

export class RefreshTokenController {
  constructor(
    private refreshTokenService: IRefreshTokenService,
    private jwtService: ITokenService
  ) {}
  async handle(req: Request, res: Response): Promise<void> {
    try {
      
      const newTokens = this.refreshTokenService.execute(
        req.cookies.userRefreshToken
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
    }
  }
}
