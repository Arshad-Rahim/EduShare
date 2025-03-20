import { Request, Response } from "express";
import { IUpdateStatusService } from "../../interfaces/serviceInterfaces/user/updateStateService";
import { CustomError } from "../../util/CustomError";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../../shared/constant";

export class UpdateStatusController {
  constructor(private UpdateStatusService: IUpdateStatusService) {}

  async handler(req: Request, res: Response) {
    try {
      const { id } = req.params;
      let { status } = req.body;
      console.log("STATUS", status);

      await this.UpdateStatusService.updateStatus(id, status);
      
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
