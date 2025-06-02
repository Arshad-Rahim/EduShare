import { Request, Response } from "express";
import { IWishlistService } from "../interfaces/serviceInterfaces/wishlistService";
import { CustomError } from "../util/CustomError";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";
import { CustomRequest } from "../middleware/authMiddleware";
import { createSecureUrl } from "../util/createSecureUrl";

export class WishlistController {
  constructor(private _wishlistService: IWishlistService) {}

  async addToWishlist(req: Request, res: Response) {
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
      const { courseId } = req.params;

      const exist = await this._wishlistService.addToWishlist(
        user.userId,
        courseId
      );
      if (exist) {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: true,
          message: SUCCESS_MESSAGES.ALREADY_WISHLIST,
        });
        return;
      }
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.ADDED_WHISHLIST,
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

  async getWishlisted(req: Request, res: Response) {
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
      const { page, limit } = req.query;

      const courses = await this._wishlistService.getWishlisted(
        user.userId,
        Number(page),
        Number(limit)
      );

      // Ensure courses exist before mapping
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

  async removeWishlist(req: Request, res: Response) {
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
      const { courseId } = req.params;

      await this._wishlistService.removeWishlist(user.userId, courseId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.REMOVED_WHISHLIST,
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
