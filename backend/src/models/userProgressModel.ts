import mongoose, { Schema } from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "course",
    required: true,
  },
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: "lesson",
    required: true,
  },
  completedAt: { type: Date, default: Date.now },
});

export const progressModel = mongoose.model('progress',progressSchema)