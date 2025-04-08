import { TOrderSave } from "../../types/order";

export interface IPurchaseRepository{
    saveOrder(userId: string, data: TOrderSave): Promise<void> 
}