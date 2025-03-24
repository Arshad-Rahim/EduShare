import { Request, Response } from "express";
import { ITutorService } from "../../interfaces/serviceInterfaces/tutor/tutorServiceInterface";
import { TUserRegister } from "../../types/user";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../../shared/constant";
import { CustomError } from "../../util/CustomError";

export class TutorController {
  constructor(private tutorService: ITutorService) {}

  async createUser(req: Request, res: Response) {
    try {
      const data: TUserRegister = req.body;

      await this.tutorService.createUser(data);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          successs: false,
          message: error.message,
        });
        return;
      }
      console.log(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }
}
