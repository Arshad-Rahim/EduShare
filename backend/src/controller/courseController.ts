import { Request, Response } from "express";
import { CustomError } from "../util/CustomError";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";
import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";
import { CustomRequest } from "../middleware/userAuthMiddleware";
import { ICourseService } from "../interfaces/serviceInterfaces/courseService";
import { createSecureUrl } from "../util/createSecureUrl";



export class CourseController {
  constructor(private _courseService: ICourseService) {}

  async addCourse(req: Request, res: Response) {
    try {
      const tutor = (req as CustomRequest).user;
      let publicId: string = "";

      if (req.file) {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary.utils.api_sign_request(
          {
            timestamp,
            folder: "course_thumbnails",
            access_mode: "authenticated",
          },
          process.env.CLOUDINARY_API_SECRET as string
        );

        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: "course_thumbnails",
              access_mode: "authenticated",
              timestamp,
              signature,
              api_key: process.env.CLOUDINARY_API_KEY as string,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result as UploadApiResponse);
            }
          );
          stream.end(req.file?.buffer);
        });

        publicId = (uploadResult as UploadApiResponse).public_id;
        console.log("Uploaded Secure Image Public ID:", publicId);
      }

      await this._courseService.addCourse(req.body, publicId, tutor?.userId);
      res.status(201).json({
        success: true,
        message: "Course created successfully",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async getTutorCourses(req: Request, res: Response) {
    try {
      const tutor = (req as CustomRequest).user;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;

      const { courses, totalCourses } =
        await this._courseService.getTutorCourses(tutor?.userId, page, limit);

      // Ensure courses exist before mapping
      const updatedCourses = courses
        ? await Promise.all(
            courses.map(async (course) => {
              if (course.thumbnail) {
              
                console.log("COURSE THUMBNAIL",course.thumbnail)
                course.thumbnail = await createSecureUrl(course.thumbnail,'image');
              }
              return course;
            })
          )
        : [];

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        courses: updatedCourses,
        totalCourses,
      });
    } catch (error) {
      console.error("Error in getTutorCourses:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }

  async updateCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      // let thumbnail: string = "";
      let publicId: string = "";
      if (req.file) {

         const timestamp = Math.round(new Date().getTime() / 1000);
         const signature = cloudinary.utils.api_sign_request(
           {
             timestamp,
             folder: "course_thumbnails",
             access_mode: "authenticated",
           },
           process.env.CLOUDINARY_API_SECRET as string
         );

        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: "course_thumbnails",
              access_mode: "authenticated",
              timestamp,
              signature,
              api_key: process.env.CLOUDINARY_API_KEY as string,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result as UploadApiResponse);
            }
          );
          stream.end(req.file?.buffer);
        });

        publicId = (uploadResult as UploadApiResponse).public_id;
         console.log("Uploaded Secure Image Public ID:", publicId);
      }
      await this._courseService.updateCourse(
        req.body,
        publicId,
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
      const search = (req.query.search as string | undefined) || "";
      const category = (req.query.category as string | undefined) || "";
      const difficulty = (req.query.difficulty as string | undefined) || "";
      const minPrice =
        typeof req.query.minPrice == "number"
          ? req.query.minPrice
          : parseInt(req.query.minPrice as string) || 0;
      const maxPrice =
        typeof req.query.maxPrice == "number"
          ? req.query.maxPrice
          : parseInt(req.query.maxPrice as string) || 1500;
      const sort = (req.query.sort as string | undefined) || "";

      const { courses, total } = await this._courseService.getAllCourses({
        page,
        limit,
        search,
        category,
        difficulty,
        minPrice,
        maxPrice,
        sort,
      });


       const updatedCourses = courses
         ? await Promise.all(
             courses.map(async (course) => {
               if (course.thumbnail) {
                 console.log("COURSE THUMBNAIL", course.thumbnail);
                 course.thumbnail = await createSecureUrl(
                   course.thumbnail,
                   "image"
                 );
               }
               return course;
             })
           )
         : [];

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        courses:{courses:updatedCourses,total},
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


  async purchaseStatus(req:Request,res:Response){
    try {
      const {courseId} = req.params;
       const user = (req as CustomRequest).user;
     const status =  await this._courseService.purchaseStatus(user?.userId,courseId)

        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
          purchaseStatus:status
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


  async getEnrolledCourses(req:Request,res:Response){
    try {
       const user = (req as CustomRequest).user;
       const courses = await this._courseService.getEnrolledCourses(user?.userId)
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
}
