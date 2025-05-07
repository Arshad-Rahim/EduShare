import { Request, Response, Router } from "express";
import Razorpay from "razorpay";
import Stripe from "stripe";
import crypto from "crypto";
import { paymentService } from "../service/paymentService";
import { CustomRequest, authMiddleware } from "../middleware/authMiddleware";
import mongoose from "mongoose";
import { WalletModel } from "../models/walletModel";
import { ICourseService } from "../interfaces/serviceInterfaces/courseService";
import { CourseService } from "../service/courseService";
import { CourseRepository } from "../repository/courseRepository";
import { purchaseModel } from "../models/purchaseModel"; // Import PurchaseModel
import { TransactionModel } from "../models/transactionModel";
import { ERROR_MESSAGES, HTTP_STATUS } from "../shared/constant";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export class PaymentRoutes {
  public router: Router;

  constructor(private _courseService: ICourseService) {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Razorpay Order Creation
    this.router.post(
      "/order",
      authMiddleware,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const { amount, currency, courseId } = req.body;
          const user = (req as CustomRequest).user;
          const userId = user?.userId;

          const options = {
            amount: amount, // Amount in paise
            currency: currency || "INR",
            receipt: `receipt_${courseId || Date.now()}`,
          };

          const order = await razorpay.orders.create(options);
          await paymentService.createRazorpayOrder(
            order.id,
            Number(order.amount) / 100, // Convert to rupees
            order.currency,
            courseId,
            userId
          );
          res.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
          });
        } catch (error) {
          console.error("Error creating Razorpay order:", error);
          res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
          });
        }
      }
    );

    // Razorpay Payment Verification
    this.router.post(
      "/",
      authMiddleware,
      async (req: AuthenticatedRequest, res: Response) => {
        const { orderDetails, status } = req.body;
        const user = (req as CustomRequest).user;
        const userId = user?.userId;

        if (status === "cancelled") {
          try {
            await paymentService.updateRazorpayPayment(
              orderDetails.orderId,
              "cancelled",
              userId
            );
            res.json({ status: "cancelled", message: "Payment cancelled" });
          } catch (error) {
            console.error("Error updating cancelled payment:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
              success: false,
              message: ERROR_MESSAGES.SERVER_ERROR,
            });
          }
          return;
        }

        const generatedSignature = crypto
          .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
          .update(`${orderDetails.orderId}|${orderDetails.paymentId}`)
          .digest("hex");

        if (generatedSignature === orderDetails.signature) {
          try {
            await paymentService.updateRazorpayPayment(
              orderDetails.orderId,
              "succeeded",
              userId
            );
            await paymentService.payment(
              orderDetails.orderId,
              {
                razorpay_payment_id: orderDetails.paymentId,
                razorpay_order_id: orderDetails.orderId,
                razorpay_signature: orderDetails.signature,
              },
              userId
            );
            res.json({ status: "success", message: "Payment verified" });
          } catch (error) {
            console.error("Error updating successful payment:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
              success: false,
              message: ERROR_MESSAGES.SERVER_ERROR,
            });
          }
        } else {
          res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ status: "failure", message: "Invalid signature" });
        }
      }
    );

    // Create Stripe PaymentIntent
    this.router.post(
      "/stripe/create-payment-intent",
      authMiddleware,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const { amount, currency, courseId } = req.body;
          const user = (req as CustomRequest).user;
          const userId = user?.userId;

          if (!amount || !currency || !courseId) {
            res
              .status(HTTP_STATUS.BAD_REQUEST)
              .json({ error: "Missing required fields" });
            return;
          }

          const paymentIntent = await stripe.paymentIntents.create({
            amount, // Amount in cents
            currency,
            metadata: { courseId, userId },
            payment_method_types: ["card"],
          });

          await paymentService.createStripePayment(
            paymentIntent.id,
            amount / 100, // Convert to dollars
            currency,
            courseId,
            userId
          );
          res.json({ clientSecret: paymentIntent.client_secret });
        } catch (error: any) {
          console.error("Error creating PaymentIntent:", error);
          res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
          });
        }
      }
    );

    // Update Stripe Payment Status
    this.router.post(
      "/stripe",
      authMiddleware,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const { paymentIntentId, status } = req.body;
          const user = (req as CustomRequest).user;
          const userId = user?.userId;

          if (!paymentIntentId || !status) {
            res
              .status(HTTP_STATUS.BAD_REQUEST)
              .json({ error: "Missing required fields" });
            return;
          }

          await paymentService.updateStripePayment(
            paymentIntentId,
            status,
            userId
          );
          if (status === "succeeded") {
            await paymentService.stripePayment(paymentIntentId, userId);
          }
          res.json({ success: true });
        } catch (error: any) {
          console.error("Error updating Stripe payment:", error);
          res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
          });
        }
      }
    );

    // Enrollment Update with Wallet Management
    this.router.post(
      "/enrollment",
      authMiddleware,
      async (req: AuthenticatedRequest, res: Response) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          const { courseId, orderId, paymentIntentId, amount } = req.body;
          const user = (req as CustomRequest).user;
          const userId = user?.userId;

          if (!courseId || (!orderId && !paymentIntentId) || !amount) {
            console.log("Missing fields:", {
              courseId,
              orderId,
              paymentIntentId,
              amount,
            });
            throw new Error("Missing required fields");
          }

          const transactionId = orderId || paymentIntentId;
          console.log("Updating enrollment for:", {
            userId,
            transactionId,
            courseId,
            amount,
          });

          // Update enrollment
          await paymentService.updateEnrollment(
            courseId,
            transactionId,
            amount,
            userId
          );

          // Find the Purchase document using the orderId or paymentIntentId
          const purchase = await purchaseModel
            .findOne({
              userId,
              "purchase.orderId": transactionId,
            })
            .session(session);

          if (!purchase) {
            throw new Error("Purchase not found for the given transactionId");
          }

          // Get the purchase document's _id
          const purchaseId = purchase._id;

          // Fetch course to get tutorId
          const course = await this._courseService.getCourseDetails(courseId);
          if (!course || !course.tutorId) {
            throw new Error("Course or tutor not found");
          }
          const tutorId = course.tutorId;

          // Calculate payment split: 10% to admin, 90% to tutor
          const adminShare = amount * 0.1; // 10%
          const tutorShare = amount * 0.9; // 90%

          // Admin Wallet Update
          let adminWallet = await WalletModel.findOne({
            userId: process.env.ADMIN_ID, // Replace with your admin userId
          }).session(session);
          if (!adminWallet) {
            adminWallet = new WalletModel({
              userId: process.env.ADMIN_ID,
              balance: 0,
            });
            await adminWallet.save({ session });
          }
          adminWallet.balance += adminShare;
          await adminWallet.save({ session });

          // Admin Transaction
          const adminTransaction = new TransactionModel({
            transactionId: `txn_admin_${Date.now()}`,
            wallet_id: adminWallet._id,
            purchase_id: purchaseId, // Use the Purchase document's _id
            transaction_type: "credit",
            amount: adminShare,
            description: `Payment split for course purchase (Course ID: ${courseId})`,
          });
          await adminTransaction.save({ session });

          // Tutor Wallet Update
          let tutorWallet = await WalletModel.findOne({
            userId: tutorId,
          }).session(session);
          if (!tutorWallet) {
            tutorWallet = new WalletModel({
              userId: tutorId,
              balance: 0,
            });
            await tutorWallet.save({ session });
          }
          tutorWallet.balance += tutorShare;
          await tutorWallet.save({ session });

          // Tutor Transaction
          const tutorTransaction = new TransactionModel({
            transactionId: `txn_tutor_${Date.now()}`,
            wallet_id: tutorWallet._id,
            purchase_id: purchaseId, // Use the Purchase document's _id
            transaction_type: "credit",
            amount: tutorShare,
            description: `Payment split for course purchase (Course ID: ${courseId})`,
          });
          await tutorTransaction.save({ session });

          // Commit the transaction
          await session.commitTransaction();
          res.json({ success: true });
        } catch (error: any) {
          await session.abortTransaction();
          console.error("Error updating enrollment or wallets:", error);
          res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
          });
        } finally {
          session.endSession();
        }
      }
    );
  }
}

const courseRepository = new CourseRepository();
const courseService = new CourseService(courseRepository);
export default new PaymentRoutes(courseService).router;
