import { Request, Response } from "express";
import { IFindUserByIdService } from "../../interfaces/serviceInterfaces/user/findUserByIdService";
import { CustomError } from "../../util/CustomError";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../../shared/constant";
import { JwtService } from "../../service/jwt/jwtService";
import {
  CustomJwtPayload,
  CustomRequest,
} from "../../middleware/userAuthMiddleware";

const tokenService = new JwtService();
export class FindUserByIdController {
  constructor(private findUsersByIdService: IFindUserByIdService) {}

  async handle(req: Request, res: Response) {
    try {
      const user = (req as CustomRequest).user;
      console.log("USER IN FINDUSERCONTROLLER", user);

      console.log("USERID", user.userId);
      const users = await this.findUsersByIdService.findById(user?.userId);
      console.log("USERS IN BACK Controller", users);
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
