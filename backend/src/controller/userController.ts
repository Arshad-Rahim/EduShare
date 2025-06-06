import { Request, Response } from "express";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";
import { CustomError } from "../util/CustomError";
import { CustomRequest } from "../middleware/authMiddleware";
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
      if (!user || !user.userId || !user.email) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({
            success: false,
            message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          });
        return;
      }

      let users = await this._userService.logedInUserData(user.userId);
      if (!users) {
        users = await this._userRepository.findByEmail(user.email);
      }

      res.status(HTTP_STATUS.OK).json({
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

  async findUserData(req: Request, res: Response) {
    try {
      let { userId } = req.params;
      let users = await this._userRepository.findById(userId);

      res.status(HTTP_STATUS.OK).json({
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
      const user = (req as CustomRequest).user;
      if (!user || !user.userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({
            success: false,
            message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          });
        return;
      }
      const id = user.userId;

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

  async updatePassword(req: Request, res: Response) {
    try {
      const user = (req as CustomRequest).user;
      if (!user || !user.userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({
            success: false,
            message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          });
        return;
      }
      const { newPassword } = req.body;
      const id = user.userId;

      await this._userService.updatePassword(id, newPassword);
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
