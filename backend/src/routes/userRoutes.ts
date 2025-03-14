import { Request, Response, Router } from "express";
import { injectedCreateUserController, injectedLoginUserController } from "../di/userInjection";
import { injectedOtpController } from "../di/otpInjection";
import { validateDTO } from "../middleware/validateDTO";
import {  withoutRoleRegisterSchema } from "../validation/userValidation";
import { injectedCreateTutorController } from "../di/tutorInjection";

export class UserRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/register/user",
      validateDTO(withoutRoleRegisterSchema),
      (req: Request, res: Response) =>
        injectedCreateUserController.handle(req, res)
    );

    this.router.post("/register/tutor", (req: Request, res: Response) =>
      injectedCreateTutorController.handle(req, res)
    );

    this.router.post("/register/otp", (req: Request, res: Response) =>
      injectedOtpController.otpGenerate(req, res)
    );

    this.router.post("/register/verify-otp", (req: Request, res: Response) =>
      injectedOtpController.verifyOtpToRegister(req, res)
    );

    this.router.post("/login", (req: Request, res: Response) =>
      injectedLoginUserController.loginUser(req, res)
    );
  }
}
