import mongoose, { Schema } from "mongoose";

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true, // Fixed typo from 'require'
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
      status: {
        type: String,
        required: true,
        default: "pending",
      },
      createdAt: {
        type: Date,
        default: Date.now, // Set to current date/time when the purchase item is created
      },
    },
  ],
});

export const purchaseModel = mongoose.model("purchase", purchaseSchema);
