import mongoose, { Schema } from "mongoose";


const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    balance: {
      type: Number,
      required: true, 
      default: 0,
    },
  },
  {
    timestamps: true, 
  }
);

walletSchema.index({ userId: 1 });

export const WalletModel = mongoose.model("wallet", walletSchema);
