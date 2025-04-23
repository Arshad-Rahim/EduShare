import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  communityId: {
    type: String,
    required: true,
    index: true, // Index for faster queries by communityId
  },
  sender: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
});

export const MessageModel = mongoose.model("Meassage",messageSchema)