import mongoose, { isValidObjectId } from "mongoose";
import { purchaseModel } from "../models/purchaseModel"; // Adjust import based on your model

export const paymentService = {
  // Create Razorpay Order
  async createRazorpayOrder(
    orderId: string,
    amount: number, // In rupees
    currency: string,
    courseId: string,
    userId: string
  ) {
    if (!isValidObjectId(courseId) || !isValidObjectId(userId)) {
      throw new Error("Invalid courseId or userId");
    }
    // Optionally store order details in a separate model if needed
  },

  // Update Razorpay Payment Status
  async updateRazorpayPayment(orderId: string, status: string, userId: string) {
    if (!isValidObjectId(userId)) {
      throw new Error("Invalid userId");
    }
    // Optionally update a payment model if tracking payment status separately
  },

  // Verify Razorpay Payment
  async payment(
    orderId: string,
    response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    },
    userId: string
  ) {
    if (!isValidObjectId(userId)) {
      throw new Error("Invalid userId");
    }
    // Optionally store payment verification details
  },

  // Create Stripe Payment
  async createStripePayment(
    paymentIntentId: string,
    amount: number, // In dollars
    currency: string,
    courseId: string,
    userId: string
  ) {
    if (!isValidObjectId(courseId) || !isValidObjectId(userId)) {
      throw new Error("Invalid courseId or userId");
    }
    // Optionally store payment intent details in a separate model
  },

  // Update Stripe Payment Status
  async updateStripePayment(
    paymentIntentId: string,
    status: string,
    userId: string
  ) {
    if (!isValidObjectId(userId)) {
      throw new Error("Invalid userId");
    }
    // Optionally update a payment model if tracking payment status separately
  },

  // Update Stripe Payment
  async stripePayment(paymentIntentId: string, userId: string) {
    if (!isValidObjectId(userId)) {
      throw new Error("Invalid userId");
    }
    // Optionally perform additional Stripe-specific actions
  },

  // Update Enrollment (handles both Razorpay and Stripe)
  async updateEnrollment(
    courseId: string,
    transactionId: string,
    amount: number, // In rupees (Razorpay) or dollars (Stripe)
    userId: string
  ) {
    if (!isValidObjectId(courseId) || !isValidObjectId(userId)) {
      throw new Error("Invalid courseId or userId");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingPurchase = await purchaseModel
        .findOne({
          userId,
          "purchase.orderId": transactionId,
        })
        .session(session);

      if (existingPurchase) {
        console.log(
          "Purchase already exists for transactionId:",
          transactionId
        );
        await session.commitTransaction();
        return;
      }

      await purchaseModel
        .findOneAndUpdate(
          { userId },
          {
            $push: {
              purchase: {
                courseId,
                orderId: transactionId,
                amount,
                currency: transactionId.startsWith("pi_") ? "usd" : "INR",
                status: "succeeded",
                createdAt: new Date(),
              },
            },
          },
          { upsert: true, session }
        )
        .session(session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },
};
