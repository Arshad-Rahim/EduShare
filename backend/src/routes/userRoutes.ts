import { Request, Response, Router } from "express";
import {
  injectedCreateUserController,
  injectedLoginUserController,
  injectedPaginatedUserController,
  injectedResetPasswordController,
  injectedVerifyUserController,
} from "../di/userInjection";
import { injectedOtpController } from "../di/otpInjection";
import { validateDTO } from "../middleware/validateDTO";
import { withoutRoleRegisterSchema } from "../validation/userValidation";
import { injectedCreateTutorController } from "../di/tutorInjection";
import { adminAuthMiddleware } from "../middleware/adminAuthMiddleware";
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

    this.router.post("/verifyEmail", (req: Request, res: Response) =>
      injectedVerifyUserController.verifyEmail(req, res)
    );

    // this.router.get(
    //   "/usersList",
    //   adminAuthMiddleware,
    //   (req: Request, res: Response) =>
    //     injectedFindAllUserController.handle(req, res)
    // );


     this.router.get(
       "/usersList",
       adminAuthMiddleware,
       (req: Request, res: Response) =>
         injectedPaginatedUserController.handle(req, res)
     );

    this.router.post("/resetPassword", (req: Request, res: Response) =>
      injectedResetPasswordController.resetPassword(req, res)
    );
 

    // Protected route
    // this.router.get("/profile", verifyToken, (req: Request, res: Response) => {
    //   const userId = req.userId; // Type-safe with express.d.ts
    //   res.json({ message: "Protected profile route", userId });
    // });
  }
}
