import { Request, Response } from "express";
import { IUpdateRejectedReasonTutorService } from "../../interfaces/serviceInterfaces/tutor/updateRejectedReasonTutorService";
import { CustomError } from "../../util/CustomError";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../../shared/constant";

export class UpdateRejectedReasonTutorController {
  constructor(
    private updateRejectedReasonTutorService: IUpdateRejectedReasonTutorService
  ) {}

  async handle(req: Request, res: Response) {
    try {
      const { tutorId } = req.params;
      const { reason } = req.body;

      console.log(`ID:${tutorId} , reason:${reason}`);
      await this.updateRejectedReasonTutorService.updateRejectedReason(
        tutorId.toString(),
        reason
      );
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
