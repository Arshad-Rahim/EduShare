import { authAxiosInstance } from "@/api/authAxiosInstance";

export const paymentService = {
  async payment(orderId: string, response) {
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
  async purchaseOrder(courseId:string,orderId:string,amount:number) {
    try {
      await authAxiosInstance.post("/purchase/order", {
        courseId,
        orderId: orderId,
        amount: amount,
        status: "paid",
      });
    } catch (error) {
      throw error;
    }
  },
};
