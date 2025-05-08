import { Router, Request, Response } from "express";
import { injectedTutorController } from "../di/tutorInjection";
import { upload } from "../util/multer";

import { checkUserBlocked } from "../middleware/checkUserBlocked";
import { authMiddleware, authorizeRole } from "../middleware/authMiddleware";

export class TutorRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/profileUpdate",
      upload.single("file"),
      authMiddleware,
      authorizeRole(["tutor"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedTutorController.updateProfile(req, res)
    );

    this.router.get(
      "/notifications",
      authMiddleware,
      authorizeRole(["tutor"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedTutorController.getNotification(req, res)
    );

    this.router.get(
      "/me",
      authMiddleware,
      authorizeRole(["tutor","admin"]),
      checkUserBlocked,
      (req: Request, res: Response) =>
        injectedTutorController.getTutorDetails(req, res)
    );

    this.router.put(
      "/notifications/read-all",
      authMiddleware,
      authorizeRole(["tutor"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedTutorController.markAllNotificationsAsRead(req, res)
    );


     this.router.get(
       "/students",
       authMiddleware,
       authorizeRole(["tutor"]),
       checkUserBlocked,

       (req: Request, res: Response) =>
         injectedTutorController.getEnrolledStudent(req, res)
     );


     this.router.get(
       "/trending",
       authMiddleware,
       authorizeRole(["admin","tutor"]),
       checkUserBlocked,

       (req: Request, res: Response) =>
         injectedTutorController.tutorPurchaseCount(req, res)
     );
  }
}

export default new TutorRoutes().router;
