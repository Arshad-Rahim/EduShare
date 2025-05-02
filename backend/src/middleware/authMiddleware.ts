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

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies.userAccessToken ??
      req.cookies.tutorAccessToken ??
      req.cookies.adminAccessToken;

    if (!token) {
      console.log("no token");
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
      return;
    }

    const user = tokenService.verifyAccessToken(token) as CustomJwtPayload;
    if (!user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
      return;
    }

    (req as CustomRequest).user = user;

    next();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
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
  }
};

export const decodeToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies.userAccessToken ??
      req.cookies.tutorAccessToken ??
      req.cookies.adminAccessToken;

    if (!token) {
      console.log("no token");
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
      return;
    }

    const user = tokenService.decodeAccessToken(token);

    if (!user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.INVALID_TOKEN });

      return;
    }

    (req as CustomRequest).user = {
      id: user.userId,
      email: user.email,
      role: user.role,
    };
    console.log("decoded", user);
    next();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
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
  }
};

export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as CustomRequest).user;

    if (!user || !allowedRoles.includes(user.role)) {
      console.log("role not allowed");
      res.status(HTTP_STATUS.FORBIDDEN).json({
        message: ERROR_MESSAGES.NOT_ALLOWED,
        userRole: user ? user.role : "None",
      });
      return;
    }
    next();
  };
};
