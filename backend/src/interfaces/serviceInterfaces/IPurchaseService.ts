import { TOrderSave } from "../../types/order";
import { TPurchase } from "../../types/purchase";

export interface IPurchaseService{
    saveOrder(userId: string, data: TOrderSave): Promise<void> 
    allPurchase(): Promise<TPurchase[]>
}