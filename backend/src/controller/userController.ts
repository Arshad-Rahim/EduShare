import { Request, Response } from "express";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";
import { CustomError } from "../util/CustomError";
import { CustomRequest } from "../middleware/userAuthMiddleware";
import { IUserService } from "../interfaces/serviceInterfaces/userService";
import { IUserRepository } from "../interfaces/repositoryInterfaces/IUserRepository";
import { IUserProfileRepository } from "../interfaces/repositoryInterfaces/IUserProfileRepository";

export class UserController {
  constructor(
    private _userService: IUserService,

    private _userRepository: IUserRepository,

    private _userProfileRepository: IUserProfileRepository
  ) {}

  async logedInUserData(req: Request, res: Response) {
    try {
      const user = (req as CustomRequest).user;

      let users = await this._userService.logedInUserData(user?.userId);
      if (!users) {
        users = await this._userRepository.findByEmail(user?.email);
      }

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        users,
      });
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

  async updateUserProfile(req: Request, res: Response) {
    try {
      const id = (req as CustomRequest).user.userId;
      await this._userProfileRepository.updateUserProfile(req.body, id);
      res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
      });
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

  async updatePassword(req:Request,res:Response){
    try {

      const { newPassword } = req.body;
       const id = (req as CustomRequest).user.userId;

       await this._userService.updatePassword(id,newPassword);
        res.status(HTTP_STATUS.OK).json({
          message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
        });
      
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
