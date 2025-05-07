import { Router, Request, Response } from "express";
import { injectedUserController } from "../di/userInjection";
import {
  authorizeRole,
  authMiddleware,
} from "../middleware/authMiddleware";
import { injectedAuthController } from "../di/authInjection";

export class UserRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Get current user profile
    this.router.get(
      "/me",
      authMiddleware,
      authorizeRole(["user"]),
      (req: Request, res: Response) =>
        injectedUserController.logedInUserData(req, res)
    );

    this.router.get(
      "/:userId",
      authMiddleware,
      authorizeRole(["user","tutor"]),
      (req: Request, res: Response) =>
        injectedUserController.findUserData(req, res)
    );

    this.router.post(
      "/profileUpdate",
      authMiddleware,
      authorizeRole(["user"]),
      (req: Request, res: Response) =>
        injectedUserController.updateUserProfile(req, res)
    );



    this.router.post(
      "/verify-password",
      authMiddleware,
      authorizeRole(["user"]),
      (req: Request, res: Response) =>
        injectedAuthController.verifyPassword(req, res)
    );



     this.router.post(
       "/update-password",
       authMiddleware,
       authorizeRole(["user"]),
       (req: Request, res: Response) =>
         injectedUserController.updatePassword(req, res)
     );
  }
}

export default new UserRoutes().router;
