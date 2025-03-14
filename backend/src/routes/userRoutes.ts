import { Request, Response, Router } from "express";
import { injectedUserController } from "../di/userInjection";
import { injectedTutorController } from "../di/tutorInjection";
import { injectedOtpController } from "../di/otpInjection";

export class UserRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/register/user", (req: Request, res: Response) =>
      injectedUserController.createUser(req, res)
    );

    this.router.post("/register/tutor", (req: Request, res: Response) =>
      injectedTutorController.createUser(req, res)
    );

    this.router.post("/register/otp", (req: Request, res: Response) =>
      injectedOtpController.otpGenerate(req, res)
    );

    this.router.post("/register/verify-otp", (req: Request, res: Response) =>
      injectedUserController.verifyOtpToRegister(req, res)
    );
  }
}
