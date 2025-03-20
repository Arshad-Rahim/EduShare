import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user", "tutor"],
    default: "user",
  },
  isBlocked:{
    type:Boolean,
    default:false,
  },
  isAccepted:{
    type:Boolean,
    default:false,
  }
});

export const userModel = mongoose.model("user", userSchema);
