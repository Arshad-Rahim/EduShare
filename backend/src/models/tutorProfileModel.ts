import mongoose from "mongoose";


const tutorProfileSchema = new mongoose.Schema({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  phone: {
    type: String,
    required: false,
  },
  specialization: {
    type: String,
    required: false,
  },
  bio: {
    type: String,
    required: false,
  },
  verificationDocUrl: {
    type: String,
    required: false,
  },
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejectionReason:{
    type:String,
    required:false,
  }
});


export const tutorProfileModel= mongoose.model('tutorProfile',tutorProfileSchema) 