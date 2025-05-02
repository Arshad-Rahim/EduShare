import { Request, Response, Router } from "express";
import {
  authorizeRole,
  authMiddleware,
} from "../middleware/authMiddleware";
import { checkUserBlocked } from "../middleware/checkUserBlocked";
import { injectedWishlistController } from "../di/wishlistInjection";

export class WishlistRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/:courseId",
      authMiddleware,
      authorizeRole(["user"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedWishlistController.addToWishlist(req, res)
    );

    this.router.get(
      "/",
      authMiddleware,
      authorizeRole(["user"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedWishlistController.getWishlisted(req, res)
    );

    this.router.delete(
      "/:courseId",
      authMiddleware,
      authorizeRole(["user"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedWishlistController.removeWishlist(req, res)
    );
  }
}

export default new WishlistRoutes().router;
