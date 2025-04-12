import { Request, Response, Router } from "express";
import {
  authorizeRole,
  userAuthMiddleware,
} from "../middleware/userAuthMiddleware";
import { checkUserBlocked } from "../middleware/checkUserBlocked";
import { injectedCourseController } from "../di/courseInjection";
import { upload } from "../util/multer";

export class CourseRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/add",
      upload.single("thumbnail"),
      userAuthMiddleware,
      authorizeRole(["tutor"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedCourseController.addCourse(req, res)
    );

    this.router.get(
      "/my-courses",
      userAuthMiddleware,
      authorizeRole(["tutor"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedCourseController.getTutorCourses(req, res)
    );

    this.router.put(
      "/update/:courseId",
      upload.single("thumbnail"),
      userAuthMiddleware,
      authorizeRole(["tutor"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedCourseController.updateCourse(req, res)
    );

    this.router.delete(
      "/delete/:courseId",
      userAuthMiddleware,
      authorizeRole(["tutor"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedCourseController.deleteCourse(req, res)
    );


     this.router.get(
       "/all-courses",
       userAuthMiddleware,
       authorizeRole(["user"]),
       checkUserBlocked,

       (req: Request, res: Response) =>
         injectedCourseController.getAllCourses(req, res)
     );


      this.router.get(
        "/:courseId/purchase-status",
        userAuthMiddleware,
        authorizeRole(["user"]),
        checkUserBlocked,

        (req: Request, res: Response) =>
          injectedCourseController.purchaseStatus(req, res)
      );

  }
}

export default new CourseRoutes().router;
