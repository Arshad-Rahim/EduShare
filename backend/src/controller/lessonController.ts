import { Request, Response } from "express";
import { LessonService } from "../service/lessonService";
import { CustomError } from "../util/CustomError";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { createSecureUrl } from "../util/createSecureUrl";
import { s3 } from "../app";
import { ObjectCannedACL, PutObjectCommand } from "@aws-sdk/client-s3";

export class LessonController {
  constructor(private _lessonService: LessonService) {}

  async addLesson(req: Request, res: Response) {
    try {
      // let publicId: string = "";
      let key: string = ""; 
      if (req.file) {
        // this code is for uploading the image in the cloudinary

        //   const timestamp = Math.round(new Date().getTime() / 1000);
        //   const signature = cloudinary.utils.api_sign_request(
        //     {
        //       timestamp,
        //       folder: "lessons_video",
        //       access_mode: "authenticated",
        //     },
        //     process.env.CLOUDINARY_API_SECRET as string
        //   );

        //   const uploadResult = await new Promise((resolve, reject) => {
        //     const stream = cloudinary.uploader.upload_stream(
        //       {
        //         resource_type: "auto",
        //         folder: "lessons_video",
        //         access_mode: "authenticated",
        //         timestamp,
        //         signature,
        //         api_key: process.env.CLOUDINARY_API_KEY as string,
        //       },
        //       (error, result) => {
        //         if (error) return reject(error);
        //         resolve(result as UploadApiResponse);
        //       }
        //     );
        //     stream.end(req.file?.buffer);
        //   });

        //   publicId = (uploadResult as UploadApiResponse).public_id;
        //   console.log("Uploaded Secure Image Public ID:", publicId);
        // }
        // await this._lessonService.addLesson(req.body, publicId);
        // res.status(HTTP_STATUS.CREATED).json({
        //   success: true,
        //   message: SUCCESS_MESSAGES.CREATED,
        // });

        const timestamp = Date.now();
        const fileExtension = req.file.mimetype.split("/")[1];
        key = `lessons_video/${timestamp}.${fileExtension}`;

        // Updated: Upload to S3 instead of Cloudinary
        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET as string,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
          ACL: ObjectCannedACL.private, // Ensure the file is not publicly accessible
        };

        await s3.send(new PutObjectCommand(uploadParams));
        console.log("Uploaded to S3 with Key:", key);
      }

      await this._lessonService.addLesson(req.body, key); // Updated: Pass S3 key instead of Cloudinary publicId
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

  async getLessons(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const lessons = await this._lessonService.getLessons(courseId);

      const updatedLessons = lessons
        ? await Promise.all(
            lessons.map(async (lesson) => {
              if (lesson.file) {
                lesson.file = await createSecureUrl(lesson.file,'video');
              }
              return lesson;
            })
          )
        : [];
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        lessons:updatedLessons,
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

  async deleteLesson(req: Request, res: Response) {
    try {
      const { lessonId } = req.params;
      await this._lessonService.deleteLesson(lessonId);

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

  async editLesson(req: Request, res: Response) {
    try {
      const { lessonId } = req.params;
      //  let publicId: string = "";
       let key: string = "";
      if (req.file) {
        // this code used to upload the lesson to the cloudinary

        //    const timestamp = Math.round(new Date().getTime() / 1000);
        //    const signature = cloudinary.utils.api_sign_request(
        //      {
        //        timestamp,
        //        folder: "lessons_video",
        //        access_mode: "authenticated",
        //      },
        //      process.env.CLOUDINARY_API_SECRET as string
        //    );

        //   const uploadResult = await new Promise((resolve, reject) => {
        //     const stream = cloudinary.uploader.upload_stream(
        //       {
        //         resource_type: "auto",
        //         folder: "lessons_video",
        //         access_mode: "authenticated",
        //         timestamp,
        //         signature,
        //         api_key: process.env.CLOUDINARY_API_KEY as string,
        //       },
        //       (error, result) => {
        //         if (error) return reject(error);
        //         resolve(result as UploadApiResponse);
        //       }
        //     );
        //     stream.end(req.file?.buffer);
        //   });

        //   publicId = (uploadResult as UploadApiResponse).public_id;
        //   console.log("Cloudinary URL:", publicId);
        // }
        // await this._lessonService.editLesson(req.body, publicId, lessonId);
        // res.status(HTTP_STATUS.OK).json({
        //   success: true,
        //   message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
        // });

        const timestamp = Date.now();
        const fileExtension = req.file.mimetype.split("/")[1];
        key = `lessons_video/${lessonId}-${timestamp}.${fileExtension}`;

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET as string,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
          ACL: ObjectCannedACL.private, // Ensure the file is not publicly accessible
        };

        await s3.send(new PutObjectCommand(uploadParams));
        console.log("Uploaded to S3 with Key:", key);
      }

      await this._lessonService.editLesson(req.body, key, lessonId); // Updated: Pass S3 key instead of Cloudinary publicId
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
}
