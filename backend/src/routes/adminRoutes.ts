import { Request, Response, Router } from "express";
import { authMiddleware, authorizeRole } from "../middleware/authMiddleware";
import { injectedAdminController } from "../di/adminInjection";

export class AdminRoutes{
    public router = Router();
    
    constructor(){
        this.router = Router();
        this.initializeRoute();
    }

    initializeRoute(){
      this.router.get("/usersList",authMiddleware,authorizeRole(['admin']),(req: Request, res: Response) =>
        injectedAdminController.usersList(req, res)
      );
      // // Approve a tutor
      this.router.patch(
        "/:tutorId/approve",
        authMiddleware,
        authorizeRole(["admin"]),
        (req: Request, res: Response) =>
          injectedAdminController.acceptTutor(req, res)
      );

       this.router.patch(
         "/:tutorId/reject",
         authMiddleware,
         authorizeRole(["admin"]),
         (req: Request, res: Response) =>
           injectedAdminController.rejectTutor(req, res)
       );

         this.router.patch(
           "/:id/status",
           authMiddleware,
           authorizeRole(["admin"]),
           (req: Request, res: Response) =>
             injectedAdminController.updateStatus(req, res)
         );

        // Logout
           this.router.post(
             "/logout",
             authMiddleware,
             authorizeRole(["admin"]),
             (req: Request, res: Response) =>
               injectedAdminController.logoutAdmin(req, res)
           );
    }
}


export default new AdminRoutes().router;
