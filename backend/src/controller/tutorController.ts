import { Request, Response } from "express";
import { CustomRequest } from "../middleware/userAuthMiddleware";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";
import { CustomError } from "../util/CustomError";
import { ITutorService } from "../interfaces/serviceInterfaces/tutorServiceInterface";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

export class TutorController {
  constructor(private _tutorService: ITutorService) {}

  async getNotification(req: Request, res: Response) {
    try {
      const user = (req as CustomRequest).user;
      const { userId } = user;
      const notifications = await this._tutorService.getNotification(userId);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        notifications,
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

  async updateProfile(req: Request, res: Response) {
    try {
      const id = (req as CustomRequest).user.userId;

      let verificationDocUrl: string = "";

      if (req.file) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: "tutor_verification_docs",
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result as UploadApiResponse);
            }
          );
          stream.end(req.file?.buffer);
        });

        verificationDocUrl = (uploadResult as UploadApiResponse).secure_url;
        console.log("Cloudinary URL:", verificationDocUrl);
      }

      await this._tutorService.updateProfile(req.body, id, verificationDocUrl);
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

  async getTutorDetails(req: Request, res: Response) {
    try {
      const id = (req as CustomRequest).user.userId;

      const tutor = await this._tutorService.getTutorDetails(id);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        tutor,
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

  async markAllNotificationsAsRead(req: Request, res: Response) {
    try {
      
      const id = (req as CustomRequest).user.userId;

      await this._tutorService.markAllNotificationsAsRead(id);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
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


  async getEnrolledStudent(req:Request,res:Response){
    try {

       const tutorId = (req as CustomRequest).user.userId;
       const { students, totalRevenue } =
         await this._tutorService.getEnrolledStudent(tutorId);
        res.status(HTTP_STATUS.CREATED).json({
          success: true,
          message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
          students,
          totalRevenue,
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
