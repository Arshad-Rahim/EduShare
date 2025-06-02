import { Request, Response } from "express";
import { CustomError } from "../util/CustomError";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";
import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";
import { CustomRequest } from "../middleware/authMiddleware";
import { ICourseService } from "../interfaces/serviceInterfaces/courseService";
import { createSecureUrl } from "../util/createSecureUrl";
import { s3 } from "../app";
import { ObjectCannedACL, PutObjectCommand } from "@aws-sdk/client-s3";

export class CourseController {
  constructor(private _courseService: ICourseService) {}

  async addCourse(req: Request, res: Response) {
    try {
      const tutor = (req as CustomRequest).user;
      if (!tutor || !tutor.userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({
            success: false,
            message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          });
        return;
      }
      let key: string = "";

      if (req.file) {
        const timestamp = Date.now();
        const fileExtension = req.file.mimetype.split("/")[1];
        key = `course_thumbnails/${tutor.userId}-${timestamp}.${fileExtension}`;

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET as string,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
          ACL: ObjectCannedACL.private,
        };

        await s3.send(new PutObjectCommand(uploadParams));
        console.log("Uploaded to S3 with Key:", key);
      }

      await this._courseService.addCourse(req.body, key, tutor.userId);
      res.status(201).json({
        success: true,
        message: "Course created successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }

  async getTutorCourses(req: Request, res: Response) {
    try {
      const tutor = (req as CustomRequest).user;
      if (!tutor || !tutor.userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({
            success: false,
            message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          });
        return;
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;

      const { courses, totalCourses } =
        await this._courseService.getTutorCourses(tutor.userId, page, limit);

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
      let key: string = "";
      if (req.file) {
        const timestamp = Date.now();
        const fileExtension = req.file.mimetype.split("/")[1];
        key = `course_thumbnails/${courseId}-${timestamp}.${fileExtension}`;

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET as string,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
          ACL: ObjectCannedACL.private,
        };

        await s3.send(new PutObjectCommand(uploadParams));
        console.log("Uploaded to S3 with Key:", key);
      }

      await this._courseService.updateCourse(
        req.body,
        key,
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
        courses: { courses: updatedCourses, total },
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

  async purchaseStatus(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const user = (req as CustomRequest).user;
      if (!user || !user.userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({
            success: false,
            message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          });
        return;
      }
      const status = await this._courseService.purchaseStatus(
        user.userId,
        courseId
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        purchaseStatus: status,
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

  async getEnrolledCourses(req: Request, res: Response) {
    try {
      const user = (req as CustomRequest).user;
      if (!user || !user.userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({
            success: false,
            message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          });
        return;
      }
      const courses = await this._courseService.getEnrolledCourses(user.userId);

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
        courses: updatedCourses,
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

  async getCourseTotalCount(req: Request, res: Response) {
    try {
      const courseCount = await this._courseService.getCourseTotalCount();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        courseCount,
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

  async coursePurchaseCount(req: Request, res: Response) {
    try {
      const coursePurchaseCount =
        await this._courseService.coursePurchaseCount();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        coursePurchaseCount,
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
