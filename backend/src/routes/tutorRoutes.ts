
import { Router, Request, Response } from "express";
import {
  injectedCreateTutorController,
  injectedFindNotificationController,
  injectedUpdateTutorController,
} from "../di/tutorInjection";
import { upload } from "../util/multer";
import { authorizeRole, userAuthMiddleware } from "../middleware/userAuthMiddleware";



export class TutorRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/register", (req: Request, res: Response) =>
      injectedCreateTutorController.handle(req, res)
    );

    this.router.post(
      "/profileUpdate",
      upload.single("file"),userAuthMiddleware,authorizeRole(['tutor']),
      (req: Request, res: Response) =>
        injectedUpdateTutorController.handle(req, res)
    );

    this.router.get(
      "/notifications",
      userAuthMiddleware,
      authorizeRole(["tutor"]),
      (req: Request, res: Response) =>
        injectedFindNotificationController.handler(req, res)
    );

    // // Approve a tutor
    // this.router.patch("/:tutorId/approval", (req: Request, res: Response) =>
    //   injectedAcceptTutorController.handler(req, res)
    // );
  }
}

export default new TutorRoutes().router;
