import mongoose from "mongoose";


const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tagline: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    required: true,
  },
  price: { type: String, required: true },
  about: { type: String, required: true },
  thumbnail: { type: String, required: true },
});

export const courseModel = mongoose.model('course',courseSchema)