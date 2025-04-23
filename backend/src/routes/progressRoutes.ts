import { Request, Response, Router } from "express";
import { authorizeRole, userAuthMiddleware } from "../middleware/userAuthMiddleware";
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
   userAuthMiddleware,
   authorizeRole(["user"]),
   checkUserBlocked,

   (req: Request, res: Response) =>
     injectedProgressController.markLessonCompleted(req, res)
 );


 this.router.get(
   "/:courseId/completed-lessons",
   userAuthMiddleware,
   authorizeRole(["user"]),
   checkUserBlocked,

   (req: Request, res: Response) =>
     injectedProgressController.getCompletedLessons(req, res)
 );



  }
}

export default new ProgressRoutes().router;