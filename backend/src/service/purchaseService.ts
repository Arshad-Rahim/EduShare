import { IPurchaseService } from "../interfaces/serviceInterfaces/IPurchaseService";
import { PurchaseRepository } from "../repository/purchaseRepository";
import { TOrderSave } from "../types/order";
import { TPurchase } from "../types/purchase";

export class PurchaseService implements IPurchaseService{
    constructor(private _purchaseRepository:PurchaseRepository){}


    async saveOrder(userId: string, data: TOrderSave): Promise<void> {
        await this._purchaseRepository.saveOrder(userId,data)
    }

    async allPurchase(): Promise<TPurchase[]> {
        return await this._purchaseRepository.allPurchase();
    }
}