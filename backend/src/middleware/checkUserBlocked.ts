import { NextFunction, Request, Response } from "express";
import { userModel } from "../models/userModels";
import { CustomRequest } from "./authMiddleware";
import { ERROR_MESSAGES, HTTP_STATUS } from "../shared/constant";

export const checkUserBlocked = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as CustomRequest).user;
    if (!user || !user.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: "error",
        message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
      });
      return;
    }

    const userId = user.userId;
    const userDoc = await userModel.findById(userId);
    if (!userDoc) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (userDoc.isBlocked) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Access denied: Your account has been blocked",
      });
      return;
    }
    next();
  } catch (error) {
    console.error("Error in blocked status middleware:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
    return;
  }
};
