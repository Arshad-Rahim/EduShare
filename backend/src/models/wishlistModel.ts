import mongoose, { Schema } from "mongoose";

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    require: true,
  },
  wishlist: [
    {
      courseId: {
        type: Schema.Types.ObjectId,
        ref: "course",
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});



export const wishlistModel = mongoose.model('wishlist',wishlistSchema)