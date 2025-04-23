import { Request, Response } from "express";
import { ProgressService } from "../service/progressService";
import { CustomError } from "../util/CustomError";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from "../shared/constant";
import { CustomRequest } from "../middleware/userAuthMiddleware";

export class ProgressController {
  constructor(private _progressService: ProgressService) {}

  async markLessonCompleted(req: Request, res: Response) {
    try {
      const user = (req as CustomRequest).user;
      const { lessonId } = req.params;
      const { courseId } = req.body;

      await this._progressService.markLessonCompleted(
        user?.userId,
        courseId,
        lessonId
      );
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATED,
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

  async getCompletedLessons(req:Request,res:Response){
     try {
      const {courseId} = req.params;
       const user = (req as CustomRequest).user;
      const lessons =await this._progressService.getCompletedLessons(user?.userId,courseId);
        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
          lessons
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
