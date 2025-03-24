
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  type: { type: String, enum: ["approval", "rejection"], required: true },
  message: { type: String, required: true },
  reason: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const NotificationModel = mongoose.model(
  "Notification",
  notificationSchema
);
