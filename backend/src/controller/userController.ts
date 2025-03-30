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

export class UserController {
  constructor(
    private _userService: IUserService,

    private _userRepository: IUserRepository
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
}
