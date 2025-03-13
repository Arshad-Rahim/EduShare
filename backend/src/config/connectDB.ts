import mongoose from "mongoose";

export async function connectDB() {
  try {
    const dbURL = process.env.MONGO_CONNECTION_STRING;
    if (!dbURL) {
      throw new Error("Connection String is Missing");
    }

    await mongoose.connect(dbURL);
    console.log("Database Conected Successfully");
  } catch (error) {
    console.error(error);
  }
}
