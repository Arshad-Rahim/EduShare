import { Request, Response, Router } from "express";
import { authorizeRole, userAuthMiddleware } from "../middleware/userAuthMiddleware";
import { checkUserBlocked } from "../middleware/checkUserBlocked";
import { injectedLessonController } from "../di/lessonInjection";
import { upload } from "../util/multer";

export class LessonRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes(){
    this.router.post(
      "/add",
       upload.single("file"),
      userAuthMiddleware,
      authorizeRole(["tutor"]),
      checkUserBlocked,
      (req:Request,res:Response)=>
        injectedLessonController.addLesson(req,res)
    );


     this.router.get(
       "/course/:courseId",
         userAuthMiddleware,
         authorizeRole(["tutor","user"]),
         checkUserBlocked,
       (req: Request, res: Response) =>
         injectedLessonController.getLessons(req, res)
     );


     this.router.delete(
       "/delete/:lessonId",
         userAuthMiddleware,
         authorizeRole(["tutor"]),
         checkUserBlocked,
       (req: Request, res: Response) =>
         injectedLessonController.deleteLesson(req, res)
     );


      this.router.put(
        "/:lessonId",
          userAuthMiddleware,
          authorizeRole(["tutor"]),
          checkUserBlocked,
        (req: Request, res: Response) =>
          injectedLessonController.editLesson(req, res)
      );
  }
}

export default new LessonRoutes().router;