import mongoose, { Schema } from "mongoose";


const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tagline: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    required: true,
  },
  price: { type: Number, required: true },
  about: { type: String, required: true },
  thumbnail: { type: String, required: true },
  tutorId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  enrollments: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: [],
    },
  ],
});

export const courseModel = mongoose.model('course',courseSchema)