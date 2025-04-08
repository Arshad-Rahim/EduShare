import { PurchaseController } from "../controller/purchaseController";
import { PurchaseRepository } from "../repository/purchaseRepository";
import { PurchaseService } from "../service/purchaseService";


const purchaseRepository = new PurchaseRepository();

const purchaseService = new PurchaseService(purchaseRepository);

export const injectedPurchaseController = new PurchaseController(purchaseService);