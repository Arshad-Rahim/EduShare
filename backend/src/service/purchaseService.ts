import { IPurchaseService } from "../interfaces/serviceInterfaces/IPurchaseService";
import { PurchaseRepository } from "../repository/purchaseRepository";
import { TOrderSave } from "../types/order";

export class PurchaseService implements IPurchaseService{
    constructor(private _purchaseRepository:PurchaseRepository){}


    async saveOrder(userId: string, data: TOrderSave): Promise<void> {
        await this._purchaseRepository.saveOrder(userId,data)
    }
}