import { IPurchaseRepository } from "../interfaces/repositoryInterfaces/IPurchaseRepository";
import { purchaseModel } from "../models/purchaseModel";
import { TOrderSave } from "../types/order";

export class PurchaseRepository implements IPurchaseRepository {
  async saveOrder(userId: string, data: TOrderSave): Promise<void> {
    let purchase = await purchaseModel.findOne({ userId });

    if (purchase) {
      const purchaseExist = purchase.purchase.some(
        (item) => item.courseId.toString() === data.courseId.toString()
      );
      if (purchaseExist) {
        return;
      }

      purchase.purchase.push({
        courseId: data.courseId,
        orderId: data.orderId,
        amount: data.amount,
        status: "paid",
      });
      await purchase.save();
      return;
    } else {
      purchase = await purchaseModel.create({
        userId,
        purchase: [
          {
            courseId: data.courseId,
            orderId: data.orderId,
            amount: data.amount/100,
            status: "paid",
          },
        ],
      });
      return;
    }
  }
}
