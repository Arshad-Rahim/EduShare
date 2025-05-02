import { Request, Response, Router } from "express";
import { authorizeRole, authMiddleware } from "../middleware/authMiddleware";
import { checkUserBlocked } from "../middleware/checkUserBlocked";
import { injectedProgressController } from "../di/progressInjection";

export class ProgressRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes(){


 this.router.post(
   "/:lessonId/complete",
   authMiddleware,
   authorizeRole(["user"]),
   checkUserBlocked,

   (req: Request, res: Response) =>
     injectedProgressController.markLessonCompleted(req, res)
 );


 this.router.get(
   "/:courseId/completed-lessons",
   authMiddleware,
   authorizeRole(["user"]),
   checkUserBlocked,

   (req: Request, res: Response) =>
     injectedProgressController.getCompletedLessons(req, res)
 );



  }
}

export default new ProgressRoutes().router;