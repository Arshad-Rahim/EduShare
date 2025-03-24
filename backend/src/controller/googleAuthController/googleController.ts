import { Request, Response } from "express";
import { IGoogleService } from "../../interfaces/googleAuth/googleService";
import { CustomError } from "../../util/CustomError";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constant";
import { OAuth2Client } from "google-auth-library";
import { ITokenService } from "../../interfaces/tokenServiceInterface";

export class googleController {
  constructor(
    private googleService: IGoogleService,
    private jwtService: ITokenService
  ) {}

  async handle(req: Request, res: Response) {
    try {
      const { credentialResponse, role } = req.body;
      const { credential, clientId } = credentialResponse;

      const client = new OAuth2Client();

      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      //  console.log("PAYLOAD IN SERVER", payload);
      if (
        !payload ||
        !payload.email ||
        !payload.given_name
        // !payload.family_name
      ) {
        throw new Error("Invalid token payload");
      }

      const user = await this.googleService.createUser({
        name: payload.given_name,
        email: payload.email,
        role,
      });
      console.log("USER:::::",user)

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

      res.cookie(`${role}AccessToken`, accessToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });

      res.cookie(`${role}RefreshToken`, refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });
      res
        .status(200)

        .json({ message: "Authentication successful ", userData: user });
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
}
