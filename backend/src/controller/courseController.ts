import { Request, Response } from "express";
import { CustomError } from "../util/CustomError";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { CustomRequest } from "../middleware/userAuthMiddleware";
import { ICourseService } from "../interfaces/serviceInterfaces/courseService";

export class CourseController {
  constructor(private _courseService: ICourseService) {}

  async addCourse(req: Request, res: Response) {
    try {
      const tutor = (req as CustomRequest).user;
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
      await this._courseService.addCourse(req.body, thumbnail, tutor?.userId);
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

  async getTutorCourses(req: Request, res: Response) {
    try {
      const tutor = (req as CustomRequest).user;
      const courses = await this._courseService.getTutorCourses(tutor?.userId);
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

  async deleteCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
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

  async getAllCourses(req: Request, res: Response) {
    try {

 

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined||'';
        const category = req.query.category as string | undefined||'';
        const difficulty = req.query.difficulty as string | undefined||'';
        const minPrice =
          typeof req.query.minPrice == "number"
            ? req.query.minPrice
            : parseInt(req.query.minPrice as string)||0;
        const maxPrice =
          typeof req.query.maxPrice == "number"
            ? req.query.maxPrice
            : parseInt(req.query.maxPrice as string)||1500;
        const sort = req.query.sort as string | undefined||'';
      
      const courses = await this._courseService.getAllCourses({
        page,
        limit,
        search,
        category,
        difficulty,
        minPrice,
        maxPrice,
        sort
      });

     
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
      console.log(error)
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }
}
