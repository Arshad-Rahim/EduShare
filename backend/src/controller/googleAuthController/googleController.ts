import { Request, Response } from "express";
import { IGoogleService } from "../../interfaces/googleAuth/googleService";
import { CustomError } from "../../util/CustomError";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constant";
import { ITokenService } from "../../interfaces/tokenServiceInterface";
import jwt, { Secret } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { string } from "zod";
import ms from "ms";

export class googleController {
  constructor(private googleService: IGoogleService) {}

  async handle(req: Request, res: Response) {
    try {
      const { credentialResponse, role } = req.body;
      const { credential, clientId } = credentialResponse;

      const client = new OAuth2Client();

      const accessSecret = process.env.JWT_SECRET as Secret;
      const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES || "";
      const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES || "";

      const generateAccessToken = (payload: {
        // id: string;
        email: string;
        given_name: string;
        // family_name:string;
        role: string;
      }): string => {
        return jwt.sign(
          { email: payload.email, given_name: payload.given_name, role: role },
          accessSecret,
          {
            expiresIn: accessExpiresIn as ms.StringValue,
          }
        );
      };

      const generateRefreshToken = (payload: {
        // id: string;
        email: string;
        role: string;
        given_name: string;
      }): string => {
        return jwt.sign(payload, accessSecret, {
          expiresIn: refreshExpiresIn as ms.StringValue,
        });
      };

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
      const { email, given_name }: any = payload;

      const userData = await this.googleService.createUser({
        name: given_name,
        email: email,
        role: role,
      });

      const accessToken = generateAccessToken({ email, given_name, role });

      const refreshToken = generateRefreshToken({ email, role,given_name });

      // Send the token as a cookie and response

      res.cookie(`${role}AccessToken`, accessToken, {
        httpOnly: true,
        secure: false,
        maxAge: 3600000,
      });

      res.cookie(`${role}RefreshToken`, refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });
      res
        .status(200)

        .json({ message: "Authentication successful ", userData: userData });
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
