import { Request, Response, Router } from "express";
import {
  authorizeRole,
  userAuthMiddleware,
} from "../middleware/userAuthMiddleware";
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
      userAuthMiddleware,
      authorizeRole(["user"]),
      checkUserBlocked,
      (req: Request, res: Response) =>
        injectedPurchaseController.saveOrder(req, res)
    );
  }
}

export default new PurchaseRoute().router;
