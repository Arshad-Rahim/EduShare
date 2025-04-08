import { WishlistController } from "../controller/wishlistController";
import { WishlistReposiotry } from "../repository/wishlistRepository";
import { WishlistService } from "../service/wishlistService";

const wishlistRepository = new WishlistReposiotry();

const wishlistService = new WishlistService(wishlistRepository);

export const injectedWishlistController = new WishlistController(wishlistService)