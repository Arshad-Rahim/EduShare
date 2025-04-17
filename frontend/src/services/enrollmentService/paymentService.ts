import { authAxiosInstance } from "@/api/authAxiosInstance";

export const paymentService = {
  // Razorpay payment verification
  async payment(
    orderId: string,
    response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }
  ) {
    try {
      await authAxiosInstance.post("/payment", {
        status: "succeeded",
        orderDetails: {
          orderId,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  // Enroll user in a course (used for both Razorpay and Stripe)
  async enroll(
    courseId: string,
    transactionId: string,
    amount: number,
    isStripe: boolean = false
  ) {
    try {
      await authAxiosInstance.post("/payment/enrollment", {
        courseId,
        [isStripe ? "paymentIntentId" : "orderId"]: transactionId,
        amount,
      });
    } catch (error) {
      throw error;
    }
  },
};
