import { IWishlistService } from "../interfaces/serviceInterfaces/wishlistService";
import { WishlistReposiotry } from "../repository/wishlistRepository";
import { TCourseAdd } from "../types/course";

export class WishlistService implements IWishlistService{
    constructor(private _wishlistRepository:WishlistReposiotry){}

    async addToWishlist(userId: string, courseId: string): Promise<boolean> {
      return  await this._wishlistRepository.addToWishlist(userId,courseId)
    }

    async getWishlisted(userId: string, page: number, limit: number): Promise<TCourseAdd[] | []> {
        return await this._wishlistRepository.getWishlisted(userId,page,limit)
    }

    async removeWishlist(userId: string, courseId: string): Promise<void> {
        await this._wishlistRepository.removeWishlist(userId,courseId)
    }
}