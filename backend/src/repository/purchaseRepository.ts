import { IPurchaseRepository } from "../interfaces/repositoryInterfaces/IPurchaseRepository";
import { courseModel } from "../models/courseModel";
import { purchaseModel } from "../models/purchaseModel";
import { TOrderSave } from "../types/order";
import { TPurchase } from "../types/purchase";

export class PurchaseRepository implements IPurchaseRepository {
  async saveOrder(userId: string, data: TOrderSave): Promise<void> {
    let purchase = await purchaseModel.findOne({ userId });
    if (purchase) {
      const purchaseExist = purchase.purchase.some(
        (item) => item.courseId.toString() === data.courseId.toString()
      );
      if (purchaseExist) {
        await courseModel.findByIdAndUpdate(
          data.courseId,
          { $addToSet: { enrollments: userId } },
          { new: true }
        );
        return;
      }

      purchase.purchase.push({
        courseId: data.courseId,
        orderId: data.orderId,
        amount: data.amount,
        status: "succeeded",
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
            amount: data.amount / 100,
            status: "succeeded",
          },
        ],
      });

      return;
    }
  }

  async allPurchase(): Promise<TPurchase[]> {
    const allPurchases = await purchaseModel.find().lean();
    return allPurchases as unknown as TPurchase[];
  }
}
