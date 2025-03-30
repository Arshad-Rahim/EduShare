import { Router, Request, Response } from "express";
import {
  injectedUserController,
} from "../di/userInjection";
import {
  authorizeRole,
  userAuthMiddleware,
} from "../middleware/userAuthMiddleware";

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
      userAuthMiddleware,
      authorizeRole(["user","tutor"]),
      (req: Request, res: Response) =>
        injectedUserController.logedInUserData(req, res)
    );


  }
}

export default new UserRoutes().router;
