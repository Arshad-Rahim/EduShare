import mongoose, { Schema } from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true, 
    },
    purchase_id: {
      type: Schema.Types.ObjectId,
      ref: "purchase", 
    },
    wallet_id: {
      type: Schema.Types.ObjectId,
      ref: "wallet",
      required: true, 
    },
    transaction_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    transaction_type: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true, 
    },
  },
  {
    timestamps: true, 
  }
);

transactionSchema.index({ wallet_id: 1 });
transactionSchema.index({ purchase_id: 1 });

export const TransactionModel = mongoose.model(
  "transaction",
  transactionSchema
);