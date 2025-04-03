import { Request, Response } from "express";
import { LessonService } from "../service/lessonService";
import { CustomError } from "../util/CustomError";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from "../shared/constant";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";


export class LessonController{
    constructor(private _lessonService:LessonService){}

    async addLesson(req:Request,res:Response){
        try {
              let thumbnail: string = "";
                  if (req.file) {
                    const uploadResult = await new Promise((resolve, reject) => {
                      const stream = cloudinary.uploader.upload_stream(
                        {
                          resource_type: "auto",
                          folder: "lessons video",
                        },
                        (error, result) => {
                          if (error) return reject(error);
                          resolve(result as UploadApiResponse);
                        }
                      );
                      stream.end(req.file?.buffer);
                    });
            
                    thumbnail = (uploadResult as UploadApiResponse).secure_url;
                    console.log("Cloudinary URL:", thumbnail);
                  }
                  await this._lessonService.addLesson(req.body,thumbnail);
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


    async getLessons(req:Request,res:Response){
      try {
        const {courseId} = req.params;
        const lessons = await this._lessonService.getLessons(courseId);
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