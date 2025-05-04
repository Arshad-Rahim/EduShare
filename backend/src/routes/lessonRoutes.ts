import { Request, Response, Router } from "express";
import { authorizeRole, authMiddleware } from "../middleware/authMiddleware";
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
      authMiddleware,
      authorizeRole(["tutor","admin"]),
      checkUserBlocked,
      (req:Request,res:Response)=>
        injectedLessonController.addLesson(req,res)
    );


     this.router.get(
       "/course/:courseId",
         authMiddleware,
         authorizeRole(["tutor","user","admin"]),
         checkUserBlocked,
       (req: Request, res: Response) =>
         injectedLessonController.getLessons(req, res)
     );


     this.router.delete(
       "/delete/:lessonId",
         authMiddleware,
         authorizeRole(["tutor","admin"]),
         checkUserBlocked,
       (req: Request, res: Response) =>
         injectedLessonController.deleteLesson(req, res)
     );


      this.router.put(
        "/:lessonId",
        upload.single("file"),
        authMiddleware,
        authorizeRole(["tutor", "admin"]),
        checkUserBlocked,
        (req: Request, res: Response) =>
          injectedLessonController.editLesson(req, res)
      );
  }
}

export default new LessonRoutes().router;