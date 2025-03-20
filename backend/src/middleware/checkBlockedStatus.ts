// import { Response, NextFunction } from "express";
// import { CustomRequest } from "./auth.middleware";
// import { clearAuthCookies } from "../../shared/utils/cookieHelper";
// import { IClientRepository } from "../../entities/repositoryInterfaces/client/client-respository.interface";
// import { IVendorRepository } from "../../entities/repositoryInterfaces/vendor/vendor-repository.interface";
// import { IBlackListTokenUseCase } from "../../entities/useCaseInterfaces/auth/blacklist-token-usecase.interface";
// import { IRevokeRefreshTokenUseCase } from "../../entities/useCaseInterfaces/auth/revoke-refresh-token-usecase.interface";
// import { inject, injectable } from "tsyringe";

import { NextFunction, Request, Response } from "express";
import { CustomRequest } from "./adminAuthMiddleware";
import { userModel } from "../models/userModels";

// @injectable()
// export class BlockedStatusMiddleware {
//   constructor(
//     @inject("IClientRepository")
//     private readonly clientRepository: IClientRepository,
//     @inject("IVendorRepository")
//     private readonly vendorRepository: IVendorRepository,
//     @inject("IBlackListTokenUseCase")
//     private readonly blackListTokenUseCase: IBlackListTokenUseCase,
//     @inject("IRevokeRefreshTokenUseCase")
//     private readonly revokeRefreshTokenUseCase: IRevokeRefreshTokenUseCase
//   ) {}

//   checkBlockedStatus = async (
//     req: CustomRequest,
//     res: Response,
//     next: NextFunction
//   ) => {
//     try {
//       if (!req.user) {
//         res.status(401).json({
//           status: "error",
//           message: "Unauthorized: No user found in request",
//         });
//         return;
//       }

//       const { id, role } = req.user;

//       let status: string | undefined = "active";

//       if (role === "client") {
//         const client = await this.clientRepository.findById(id);
//         if (!client) {
//           res.status(404).json({
//             success: false,
//             message: "Client not found",
//           });
//           return;
//         }
//         status = client.status;
//       } else if (role === "vendor") {
//         const vendor = await this.vendorRepository.findById(id);
//         if (!vendor) {
//           res.status(404).json({
//             success: false,
//             message: "Vendor not found",
//           });
//           return;
//         }
//         status = vendor.status;
//       } else {
//         res.status(400).json({
//           success: false,
//           message: "Invalid user role",
//         });
//         return;
//       }

//       if (status !== "active") {
//         await this.blackListTokenUseCase.execute(req.user.access_token);

//         await this.revokeRefreshTokenUseCase.execute(req.user.refresh_token);

//         const accessTokenName = `${role}_access_token`;
//         const refreshTokenName = `${role}_refresh_token`;
//         clearAuthCookies(res, accessTokenName, refreshTokenName);
//         res.status(403).json({
//           success: false,
//           message: "Access denied: Your account has been blocked",
//         });
//         return;
//       }

//       next();
//     } catch (error) {
//       console.error("Error in blocked status middleware:", error);
//       res.status(500).json({
//         success: false,
//         message: "Internal server error while checking blocked status",
//       });
//       return;
//     }
//   };
// }

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
