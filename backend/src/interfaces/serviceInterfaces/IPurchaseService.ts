import { TOrderSave } from "../../types/order";

export interface IPurchaseService{
    saveOrder(userId: string, data: TOrderSave): Promise<void> 
}