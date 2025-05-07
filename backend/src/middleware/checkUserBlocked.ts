

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
    if (!(req as CustomRequest).user) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized: No user found in request",
      });
      return;
    }

    const { userId } = (req as CustomRequest).user;
    const user = await userModel.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.isBlocked) {
      res.status(403).json({
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
