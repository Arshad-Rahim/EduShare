import { Router, Request, Response } from "express";
import {
  injectedDeleteUserController,
  injectedFindUserByIdController,
  injectedLoginUserController,
  injectedPaginatedUserController,
  injectedUpdateStatusUserController,
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
      authorizeRole(["user"]),
      (req: Request, res: Response) =>
        injectedFindUserByIdController.handle(req, res)
    );

    // Get paginated list of users
    this.router.get(
      "/list",
      userAuthMiddleware,
      authorizeRole(["user"]),
      (req: Request, res: Response) =>
        injectedPaginatedUserController.handle(req, res)
    );

    // Update user status
    this.router.patch(
      "/:id/status",
      userAuthMiddleware,
      authorizeRole(["user"]),
      (req: Request, res: Response) =>
        injectedUpdateStatusUserController.handler(req, res)
    );
  }
}

export default new UserRoutes().router;
