import { TCourseAdd } from "../../types/course";

export interface IWishlistRepository {
  addToWishlist(userId: string, courseId: string): Promise<boolean>;
  getWishlisted(
    userId: string,
    page: number,
    limit: number
  ): Promise<TCourseAdd[] | []>;
  removeWishlist(userId: string, courseId: string): Promise<void>;
}
