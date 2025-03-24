import { Router, Request, Response } from "express";
import { injectedOtpController } from "../di/otpInjection";

export class OtpRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Send OTP
    this.router.post("/sendOtp", (req: Request, res: Response) =>
      injectedOtpController.otpGenerate(req, res)
    );

    // Verify OTP
    this.router.post("/verify", (req: Request, res: Response) =>
      injectedOtpController.verifyOtpToRegister(req, res)
    );
  }
}

export default new OtpRoutes().router;
