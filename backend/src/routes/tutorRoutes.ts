
import { Router, Request, Response } from "express";
import { injectedTutorController } from "../di/tutorInjection";
import { upload } from "../util/multer";
import { authorizeRole, userAuthMiddleware } from "../middleware/userAuthMiddleware";



export class TutorRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {


    this.router.post(
      "/profileUpdate",
      upload.single("file"),userAuthMiddleware,authorizeRole(['tutor']),
      (req: Request, res: Response) =>
        injectedTutorController.updateProfile(req, res)
    );

    this.router.get(
      "/notifications",
      userAuthMiddleware,
      authorizeRole(["tutor"]),
      (req: Request, res: Response) =>
        injectedTutorController.getNotification(req, res)
    );


    this.router.get(
      "/me",
      userAuthMiddleware,
      authorizeRole(["tutor"]),
      (req: Request, res: Response) =>
        injectedTutorController.getTutorDetails(req, res)
    );

  }
}

export default new TutorRoutes().router;
