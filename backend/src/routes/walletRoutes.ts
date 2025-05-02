import { Request, Response, Router } from "express";
import {
  authorizeRole,
  authMiddleware,
} from "../middleware/authMiddleware";
import { checkUserBlocked } from "../middleware/checkUserBlocked";
import { injectedWalletController } from "../di/walletInjection";

export class WalletRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      "/get-data",
      authMiddleware,
      authorizeRole(["tutor","admin"]),
      checkUserBlocked,

      (req:Request,res:Response)=>
        injectedWalletController.walletDetails(req,res)
    );
  }
}



export default new WalletRoutes().router;