import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  otp: {
    type: String,
    require: true,
  },
  expiredAt: {
    type: Date,
    require: true,
  },
  email: {
    type: String,
    required: false,
  },
});

export const otpModel = mongoose.model("otp", otpSchema);
