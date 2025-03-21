import { JwtPayload } from "jsonwebtoken";
import { JwtService } from "../service/jwt/jwtService";
import { NextFunction, Request, Response } from "express";
import { ERROR_MESSAGES, HTTP_STATUS } from "../shared/constant";

const tokenService = new JwtService();

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface CustomRequest extends Request {
  user: CustomJwtPayload;
}

export const userAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.userAccessToken;

    if (!token) {
      console.log("no token");
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
      return;
    }

    const user = tokenService.verifyAccessToken(token) as CustomJwtPayload;
    console.log("USER IM USERAUTH",user)
    if (!user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
      return;
    }
    // console.log("TOKEN ACCESS TOKEN", token);

    (req as CustomRequest).user = user;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      console.log("token is expired is worked");
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.TOKEN_EXPIRED });
      return;
    }
    console.log("token is invalid is worked");

    res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ message: ERROR_MESSAGES.INVALID_TOKEN });
    return;
  }
};

export const decodeToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.userAccessToken;
    if (!token) {
      console.log("no token");
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
      return;
    }

    const user = tokenService.decodeAccessToken(token?.access_token);
    console.log("decoded", user);
    (req as CustomRequest).user = {
      id: user?.userId,
      email: user?.email,
      role: user?.role,
      access_token: token.access_token,
      refresh_token: token.refresh_token,
    };
    console.log("FINAL USER",user)
    next();
  } catch (error:any) {
     if (error.name === "TokenExpiredError") {
       console.log("token is expired is worked");
       res
         .status(HTTP_STATUS.UNAUTHORIZED)
         .json({ message: ERROR_MESSAGES.TOKEN_EXPIRED });
       return;
     }
     console.log("token is invalid is worked");

     res
       .status(HTTP_STATUS.UNAUTHORIZED)
       .json({ message: ERROR_MESSAGES.INVALID_TOKEN });
     return;
  }
};
