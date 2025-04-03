import { Request, Response } from "express";
import { CourseService } from "../service/courseService";
import { CustomError } from "../util/CustomError";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

export class CourseController {
  constructor(private _courseService: CourseService) {}

  async addCourse(req: Request, res: Response) {
    try {
      let thumbnail: string = "";
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

        thumbnail = (uploadResult as UploadApiResponse).secure_url;
        console.log("Cloudinary URL:", thumbnail);
      }
      await this._courseService.addCourse(req.body, thumbnail);
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

  async getAllCourses(req: Request, res: Response) {
    try {
      const courses = await this._courseService.getAllCourses();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        courses,
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

  async updateCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      let thumbnail: string = "";
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

        thumbnail = (uploadResult as UploadApiResponse).secure_url;
        console.log("Cloudinary URL:", thumbnail);
      }
      await this._courseService.updateCourse(
        req.body,
        thumbnail,
        courseId.toString()
      );
      res.status(HTTP_STATUS.OK).json({
        success: true,
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


  async deleteCourse(req:Request,res:Response){
    try {

      const {courseId} = req.params;
      await this._courseService.deleteCourse(courseId);
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
