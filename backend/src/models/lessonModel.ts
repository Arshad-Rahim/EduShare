import mongoose, { Schema } from "mongoose";


const lessonSchema = new mongoose.Schema({
     title: {
          type: String,
          required: true,
        },
        courseId: {
          type: Schema.Types.ObjectId,
          ref: "course",
          required: true,
        },
        // tutor:{
        //   type: Schema.Types.ObjectId,
        //   ref: "tutors",
        //   required: true,
        // },
        description: {
          type: String,
          required: true,
        },
        file: {
          type: String,
          required: true,
        },
        duration: {
          type: Number
        },
        order: {
          type: Number,
        },
      },
      {
        timestamps: true,
      }
)

export const lessonModel = mongoose.model('lesson',lessonSchema)