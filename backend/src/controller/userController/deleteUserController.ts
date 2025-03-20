import { Request, Response } from "express";
import { IDeleteUserService } from "../../interfaces/serviceInterfaces/user/deleteUserService";
import { CustomError } from "../../util/CustomError";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from "../../shared/constant";

export class DeleteUserController {
  constructor(private DeleteUserService: IDeleteUserService) {}

  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.DeleteUserService.deleteUser(id);
       res.status(HTTP_STATUS.OK).json({
              success: true,
              message: SUCCESS_MESSAGES.DELETE_SUCCESS,
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
