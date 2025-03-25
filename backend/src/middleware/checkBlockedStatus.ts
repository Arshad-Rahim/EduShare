

import { NextFunction, Request, Response } from "express";
import { CustomRequest } from "./adminAuthMiddleware";
import { userModel } from "../models/userModels";

export const CheckBlockedStatus = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("REQ.USER",req.user)
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized: No user found in request",
      });
      return;
    }

    const { id } = req.user;
    const user = await userModel.findById(id);
    if (!user) {

 res.status(404).json({
            success: false,
            message: "User not found",
          });
          return;
    }

    if(user.isBlocked){
         res.status(403).json({
          success: false,
          message: "Access denied: Your account has been blocked",
        });
        return;
    }
    next();


  } catch (error) {
    console.error("Error in blocked status middleware:", error);
          res.status(500).json({
            success: false,
            message: "Internal server error while checking blocked status",
          });
          return;
  }
};
