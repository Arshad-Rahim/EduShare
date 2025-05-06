import { ITransactionRepository } from "../interfaces/repositoryInterfaces/ITransactionRepository";
import { TransactionModel } from "../models/transactionModel";
import { TTransaction } from "../types/transaction";

export class TransactionRepository implements ITransactionRepository {
  async transactionDetails(
    walletId: string,
    page: number,
    limit: number,
    filters: {
      courseName?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<{
    transactions: TTransaction[] | null;
    totalTransaction: number;
  }> {
    // const transactions = await TransactionModel.find({ wallet_id: walletId })
    //   .skip((page - 1) * limit)
    //   .limit(limit)
    //   .sort({ transaction_date: -1 })
    //   .populate("purchase_id", "orderId");

    const query: any = { wallet_id: walletId };
    console.log("FILTERS IN THE REPOSITORY", filters);
    // Apply date range filter
    if (filters.startDate || filters.endDate) {
      query.transaction_date = {};
      if (filters.startDate) {
        query.transaction_date.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.transaction_date.$lte = new Date(filters.endDate);
      }
    }

    let transactions = await TransactionModel.find(query)
      .populate({
        path: "purchase_id",
        populate: [
          { path: "userId", select: "name" }, // Populate userId to get the user's name
          { path: "purchase.courseId", select: "title" }, // Populate courseId to get the course title
        ],
      })
      .lean(); // Convert Mongoose documents to plain JS objects

       if (filters.courseName) {
         const courseNameLower = filters.courseName.toLowerCase();
         transactions = transactions.filter((transaction: any) => {
           const courseTitle =
             transaction.purchase_id?.purchase?.[0]?.courseId?.title || "";
           return courseTitle.toLowerCase().includes(courseNameLower);
         });
       }

      const totalTransaction = transactions.length;
 const startIndex = (page - 1) * limit;
 const paginatedTransactions = transactions
   .sort(
     (a: any, b: any) =>
       new Date(b.transaction_date).getTime() -
       new Date(a.transaction_date).getTime()
   )
   .slice(startIndex, startIndex + limit);

    return {
      transactions: paginatedTransactions as TTransaction[],
      totalTransaction,
    };
  }
}
