import { Request, Response, Router } from "express";
import {
  injectedAcceptTutorController,
  injectedCreateUserController,
  injectedDeleteUserController,
  injectedFindUserByIdController,
  injectedGoogleController,
  injectedLoginUserController,
  injectedLogoutUserController,
  injectedPaginatedUserController,
  injectedRefreshTokenController,
  injectedResetPasswordController,
  injectedUpdateStatusUserController,
  injectedVerifyUserController,
} from "../di/userInjection";
import { injectedOtpController } from "../di/otpInjection";
import { validateDTO } from "../middleware/validateDTO";
import { withoutRoleRegisterSchema } from "../validation/userValidation";
import { injectedCreateTutorController } from "../di/tutorInjection";
import { adminAuthMiddleware } from "../middleware/adminAuthMiddleware";
import { CheckBlockedStatus } from "../middleware/checkBlockedStatus";
import { userAuthMiddleware } from "../middleware/userAuthMiddleware";
import { LogoutUserController } from "../controller/userController/logoutUserController";
// import {verifyToken} from '../middleware/adminAuthMiddleware'
export class UserRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // this.router.get("/data",adminAuthMiddleware,(req:Request,res:Response)=>{
    //   res.json({
    //     message:"Vanned makkele"
    //   })
    // })
    this.router.post(
      "/register/user",
      validateDTO(withoutRoleRegisterSchema),
      (req: Request, res: Response) =>
        injectedCreateUserController.handle(req, res)
    );

    this.router.post("/register/tutor", (req: Request, res: Response) =>
      injectedCreateTutorController.handle(req, res)
    );

    this.router.post("/sendOtp", (req: Request, res: Response) =>
      injectedOtpController.otpGenerate(req, res)
    );

    this.router.post("/verify-otp", (req: Request, res: Response) =>
      injectedOtpController.verifyOtpToRegister(req, res)
    );

    this.router.post("/login", (req: Request, res: Response) =>
      injectedLoginUserController.loginUser(req, res)
    );
// ithil ninn authUserMiddleware idith kalenjarn because of the problem in the login persistance while google login
    this.router.get(
      "/users/me",userAuthMiddleware,
      (req: Request, res: Response) =>
        injectedFindUserByIdController.handle(req, res)
    );

    this.router.post("/verifyEmail", (req: Request, res: Response) =>
      injectedVerifyUserController.verifyEmail(req, res)
    );

    this.router.post("/refresh-token", (req: Request, res: Response) =>
      injectedRefreshTokenController.handle(req, res)
    );

    // this.router.get(
    //   "/usersList",
    //   adminAuthMiddleware,
    //   (req: Request, res: Response) =>
    //     injectedFindAllUserController.handle(req, res)
    // );

    this.router.get(
      "/usersList",

      (req: Request, res: Response) =>
        injectedPaginatedUserController.handle(req, res)
    );

    this.router.delete(
      "/users/:id",

      (req: Request, res: Response) =>
        injectedDeleteUserController.handle(req, res)
    );

    this.router.patch(
      "/users/:id/status",

      (req: Request, res: Response) =>
        injectedUpdateStatusUserController.handler(req, res)
    );

    this.router.patch(
      "/tutors/:tutorId/approval",

      (req: Request, res: Response) =>
        injectedAcceptTutorController.handler(req, res)
    );

    this.router.post("/resetPassword", (req: Request, res: Response) =>
      injectedResetPasswordController.resetPassword(req, res)
    );


      this.router.post("/google-auth", (req: Request, res: Response) =>
        injectedGoogleController.handle(req, res)
      );


       this.router.post("/logout", (req: Request, res: Response) =>
         injectedLogoutUserController.logoutUser(req, res)
       );

    // Protected route
    // this.router.get("/profile", verifyToken, (req: Request, res: Response) => {
    //   const userId = req.userId; // Type-safe with express.d.ts
    //   res.json({ message: "Protected profile route", userId });
    // });
  }
}
