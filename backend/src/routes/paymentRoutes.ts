import { Request, Response, Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export class PaymentRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/order", async (req: Request, res: Response) => {
      try {
        const { amount, currency } = req.body;

        const options = {
          amount: amount,
          currency: currency || "INR",
          receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.json({
          id: order.id,
          amount: order.amount,
          currency: order.currency,
        });
      } catch (error) {
        res.status(500).json({ error: "Failed to create order" });
      }
    });

    this.router.post("/", (req: Request, res: Response) => {
      const { orderDetails } = req.body;

      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(`${orderDetails.orderId}|${orderDetails.paymentId}`)
        .digest("hex");

      if (generatedSignature === orderDetails.signature) {
        res.json({ status: "success", message: "Payment verified" });
      } else {
        res
          .status(400)
          .json({ status: "failure", message: "Invalid signature" });
      }
    });
  }
}

export default new PaymentRoutes().router;
