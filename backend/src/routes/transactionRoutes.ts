import { Request, Response, Router } from "express";
import {
  authorizeRole,
  userAuthMiddleware,
} from "../middleware/userAuthMiddleware";
import { checkUserBlocked } from "../middleware/checkUserBlocked";
import { injectedTransactionController } from "../di/transactioninjection";

export class TransactionRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      "/transaction-details",
      userAuthMiddleware,
      authorizeRole(["tutor"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedTransactionController.transactionDetails(req, res)
    );
  }
}


export default new TransactionRoutes().router;