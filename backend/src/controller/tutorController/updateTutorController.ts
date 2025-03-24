import { Request, Response } from "express";
import { CustomError } from "../../util/CustomError";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../../shared/constant";
import { IUpdateTutorProfileService } from "../../interfaces/serviceInterfaces/tutor/updateTutorProfileService";
import { CustomRequest } from "../../middleware/userAuthMiddleware";
import { v2 as cloudinary } from "cloudinary";

export class UpdateTutorController {
  constructor(private updateTutorProfileService: IUpdateTutorProfileService) {}

  async handle(req: Request, res: Response) {
    try {
      const id = (req as CustomRequest).user.userId;
      const user = (req as CustomRequest).user;
      console.log("USER id ::::",id)

      let verificationDocUrl: string ='';

      if (req.file) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: "tutor_verification_docs",
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(req.file?.buffer);
        });

        verificationDocUrl = (uploadResult as any).secure_url;
        console.log("Cloudinary URL:", verificationDocUrl);
      }

      await this.updateTutorProfileService.updateTutorProfile(
        req.body,
        id,
        verificationDocUrl
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
