import { Request, Response, Router } from "express";
import { adminAuthMiddleware } from "../middleware/adminAuthMiddleware";
import { authorizeRole } from "../middleware/userAuthMiddleware";
import { injectedAdminController } from "../di/adminInjection";

export class AdminRoutes{
    public router = Router();
    
    constructor(){
        this.router = Router();
        this.initializeRoute();
    }

    initializeRoute(){
      this.router.get("/usersList",adminAuthMiddleware,authorizeRole(['admin']),(req: Request, res: Response) =>
        injectedAdminController.usersList(req, res)
      );
      // // Approve a tutor
      this.router.patch(
        "/:tutorId/approve",
        adminAuthMiddleware,
        authorizeRole(["admin"]),
        (req: Request, res: Response) =>
          injectedAdminController.acceptTutor(req, res)
      );

       this.router.patch(
         "/:tutorId/reject",
         adminAuthMiddleware,
         authorizeRole(["admin"]),
         (req: Request, res: Response) =>
           injectedAdminController.rejectTutor(req, res)
       );

         this.router.patch(
           "/:id/status",
           adminAuthMiddleware,
           authorizeRole(["admin"]),
           (req: Request, res: Response) =>
             injectedAdminController.updateStatus(req, res)
         );

        // Logout
           this.router.post(
             "/logout",
             adminAuthMiddleware,
             authorizeRole(["admin"]),
             (req: Request, res: Response) =>
               injectedAdminController.logoutAdmin(req, res)
           );
    }
}


export default new AdminRoutes().router;
