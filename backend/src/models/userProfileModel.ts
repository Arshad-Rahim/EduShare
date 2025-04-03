import mongoose from "mongoose";


const userProfileSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    education:{
        type:String,
        required:false
    },
    aboutMe:{
        type:String,
        required:false
    },
    interests:{
        type:String,
        required:false
    }
})

export const userProfileModel = mongoose.model("userProfile", userProfileSchema);