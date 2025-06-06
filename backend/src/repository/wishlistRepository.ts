import { IWishlistRepository } from "../interfaces/repositoryInterfaces/IWishlistRepository";
import { courseModel } from "../models/courseModel";
import { wishlistModel } from "../models/wishlistModel";
import { TCourseAdd } from "../types/course";

export class WishlistReposiotry implements IWishlistRepository {
  async addToWishlist(userId: string, courseId: string): Promise<boolean> {
    let wishlist = await wishlistModel.findOne({ userId });
    if (wishlist) {
      const courseExists = wishlist.wishlist.some(
        (item) => item.courseId.toString() === courseId.toString()
      );
      if (courseExists) {
        return true;
      }

      wishlist.wishlist.push({
        courseId,
        addedAt: new Date(),
      });

      await wishlist.save();
      return false;
    } else {
      wishlist = await wishlistModel.create({
        userId,
        wishlist: [{ courseId, addedAt: new Date() }],
      });
      return false;
    }
  }

  async getWishlisted(
    userId: string,
    page: number,
    limit: number
  ): Promise<TCourseAdd[] | []> {
    const wishlist = await wishlistModel.findOne({ userId });
    if (!wishlist) {
      return [];
    }

    const courseIds = wishlist.wishlist.map((item) => item.courseId);

    // Fetch courses that are in the wishlist but not purchased by the user
    const courses = await courseModel
      .find({
        _id: { $in: courseIds },
        enrollments: { $nin: [userId] }, // Exclude courses where userId is in enrollments
      })
      .skip((page - 1) * limit)
      .limit(limit);

    return courses;
  }

  async removeWishlist(userId: string, courseId: string): Promise<void> {
    const wishlist = await wishlistModel.findOne({ userId });
    if (!wishlist) {
      return;
    }

    wishlist.wishlist.pull({ courseId });

    if (wishlist.wishlist.length === 0) {
      await wishlistModel.deleteOne({ userId });
    } else {
      await wishlist.save();
    }
  }
}

