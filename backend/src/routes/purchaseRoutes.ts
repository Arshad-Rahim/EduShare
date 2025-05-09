import { Request, Response, Router } from "express";
import {
  authorizeRole,
  authMiddleware,
} from "../middleware/authMiddleware";
import { checkUserBlocked } from "../middleware/checkUserBlocked";
import { injectedPurchaseController } from "../di/purchaseInjection";

export class PurchaseRoute {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.post(
      "/order",
      authMiddleware,
      authorizeRole(["user"]),
      checkUserBlocked,
      (req: Request, res: Response) =>
        injectedPurchaseController.saveOrder(req, res)
    );

     this.router.get(
       "/all",
       authMiddleware,
       authorizeRole(["admin"]),
       checkUserBlocked,
       (req: Request, res: Response) =>
         injectedPurchaseController.allPurchase(req, res)
     );
  }
}

export default new PurchaseRoute().router;
