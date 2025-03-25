import { Request, Response, Router } from "express";
import { adminAuthMiddleware } from "../middleware/adminAuthMiddleware";
import { injectedAcceptTutorController, injectedPaginatedUserController } from "../di/userInjection";
import { injectedUpdateRejectedReasonTutorService } from "../di/tutorInjection";
import { injectedLogoutAdminController } from "../di/adminInjection";
import { authorizeRole } from "../middleware/userAuthMiddleware";

export class AdminRoutes{
    public router = Router();
    
    constructor(){
        this.router = Router();
        this.initializeRoute();
    }

    initializeRoute(){
      // ,adminAuthMiddleware,authorizeRole(['admin']), 
      this.router.get("/usersList",(req: Request, res: Response) =>
        injectedPaginatedUserController.handle(req, res)
      );
      // // Approve a tutor
      this.router.patch(
        "/:tutorId/approve",
        adminAuthMiddleware,
        authorizeRole(["admin"]),
        (req: Request, res: Response) =>
          injectedAcceptTutorController.handler(req, res)
      );

       this.router.patch(
         "/:tutorId/reject",
         adminAuthMiddleware,
         authorizeRole(["admin"]),
         (req: Request, res: Response) =>
           injectedUpdateRejectedReasonTutorService.handle(req, res)
       );

        // Logout
           this.router.post(
             "/logout",
             adminAuthMiddleware,
             authorizeRole(["admin"]),
             (req: Request, res: Response) =>
               injectedLogoutAdminController.logoutAdmin(req, res)
           );
    }
}


export default new AdminRoutes().router;
