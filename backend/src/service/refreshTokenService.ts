
import { JwtPayload } from "jsonwebtoken";
import { IRefreshTokenService } from "../interfaces/serviceInterfaces/refreshTokenService";
import { ITokenService } from "../interfaces/tokenServiceInterface";
import { CustomError } from "../util/CustomError";
import { HTTP_STATUS } from "../shared/constant";

export class RefreshTokenService implements IRefreshTokenService {
  constructor(private _tokenService: ITokenService) {}

  execute(refreshToken: string): {
    role: string;
    accessToken: string;
  } {
    console.log('refresh token inside refrsh tokcen service', refreshToken)
    const payload = this._tokenService.verifyRefreshtoken(refreshToken);
    if (!payload)
      throw new CustomError("Invalid refresh token", HTTP_STATUS.BAD_REQUEST);

    return {
      role: (payload as JwtPayload).role,
      accessToken: this._tokenService.generateAccessToken({
        id: (payload as JwtPayload).id,
        email: (payload as JwtPayload).email,
        role: (payload as JwtPayload).role,
      }),
    };
  }
}
