import mongoose, { Schema } from "mongoose";

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    require: true,
  },
  purchase: [
    {
      courseId: {
        type: Schema.Types.ObjectId,
        ref: "course",
        required: true,
      },
      orderId: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    //   currency: {
    //     type: String, // Added to store currency (e.g., "INR", "usd")
    //     required: false,
    //   },
      status: {
        type: String,
        required: true,
        default: "pending",
      },
    },
  ],
});

export const purchaseModel = mongoose.model("purchase", purchaseSchema);
