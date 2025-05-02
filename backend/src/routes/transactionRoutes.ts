import { Request, Response, Router } from "express";
import {
  authorizeRole,
  authMiddleware,
} from "../middleware/authMiddleware";
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
      authMiddleware,
      authorizeRole(["tutor","admin"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedTransactionController.transactionDetails(req, res)
    );
  }
}


export default new TransactionRoutes().router;