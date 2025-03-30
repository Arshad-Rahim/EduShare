import { Router, Request, Response } from "express";
import {
  injectedGoogleController,
  injectedRefreshTokenController,
} from "../di/userInjection";
import { validateDTO } from "../middleware/validateDTO";
import { withoutRoleRegisterSchema } from "../validation/userValidation";
import { injectedAuthController } from "../di/authInjection";

export class AuthRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Register a new user
    this.router.post(
      "/register/user",
      validateDTO(withoutRoleRegisterSchema),
      (req: Request, res: Response) =>
        injectedAuthController.registerUser(req, res)
    );

    // Login
    this.router.post("/login", (req: Request, res: Response) =>
      injectedAuthController.loginUser(req, res)
    );

    // Logout
    this.router.post("/logout", (req: Request, res: Response) =>
      injectedAuthController.logoutUser(req, res)
    );

    // Google authentication
    this.router.post("/google-auth", (req: Request, res: Response) =>
      injectedGoogleController.handle(req, res)
    );

    // Refresh token
    this.router.post("/refresh-token", (req: Request, res: Response) =>
      injectedRefreshTokenController.handle(req, res)
    );

    // Reset password
    this.router.post("/resetPassword", (req: Request, res: Response) =>
      injectedAuthController.resetPassword(req, res)
    );

    // Verify email
    this.router.post("/verifyEmail", (req: Request, res: Response) =>
      injectedAuthController.verifyEmail(req, res)
    );
  }
}

export default new AuthRoutes().router;
