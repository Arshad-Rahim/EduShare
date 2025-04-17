import { Request, Response, Router } from "express";
import Razorpay from "razorpay";
import Stripe from "stripe";
import crypto from "crypto";
import { paymentService } from "../service/paymentService";
import {
  CustomRequest,
  userAuthMiddleware,
} from "../middleware/userAuthMiddleware";

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

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Razorpay Order Creation
    this.router.post(
      "/order",
      userAuthMiddleware,
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
          res.status(500).json({ error: "Failed to create order" });
        }
      }
    );

    // Razorpay Payment Verification
    this.router.post(
      "/",
      userAuthMiddleware,
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
            res.status(500).json({ error: "Failed to update payment status" });
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
            res.status(500).json({ error: "Failed to update payment status" });
          }
        } else {
          res
            .status(400)
            .json({ status: "failure", message: "Invalid signature" });
        }
      }
    );

    // Create Stripe PaymentIntent
    this.router.post(
      "/stripe/create-payment-intent",
      userAuthMiddleware,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const { amount, currency, courseId } = req.body;
          const user = (req as CustomRequest).user;
          const userId = user?.userId;

          if (!amount || !currency || !courseId) {
            res.status(400).json({ error: "Missing required fields" });
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
          res.status(500).json({ error: error.message });
        }
      }
    );

    // Update Stripe Payment Status
    this.router.post(
      "/stripe",
      userAuthMiddleware,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const { paymentIntentId, status } = req.body;
          const user = (req as CustomRequest).user;
          const userId = user?.userId;

          if (!paymentIntentId || !status) {
            res.status(400).json({ error: "Missing required fields" });
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
          res.status(500).json({ error: error.message });
        }
      }
    );

    // Enrollment Update
    this.router.post(
      "/enrollment",
      userAuthMiddleware,
      async (req: AuthenticatedRequest, res: Response) => {
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
            res.status(400).json({ error: "Missing required fields" });
            return;
          }

          const transactionId = orderId || paymentIntentId;
          console.log("Updating enrollment for:", {
            userId,
            transactionId,
            courseId,
            amount,
          });

          await paymentService.updateEnrollment(
            courseId,
            transactionId,
            amount,
            userId
          );

          res.json({ success: true });
        } catch (error: any) {
          console.error("Error updating enrollment:", error);
          res.status(500).json({ error: error.message });
        }
      }
    );
  }
}

export default new PaymentRoutes().router;
