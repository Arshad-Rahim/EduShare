import dotenv from "dotenv";
dotenv.config();

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/connectDB";
import userRoutes, { UserRoutes } from "./routes/userRoutes";
import { corsOptions } from "./middleware/corsOptionConfiguration";
import { handleError } from "./middleware/errorHandlingMiddleware";
import tutorRoutes from "./routes/tutorRoutes";
import authRoutes from "./routes/authRoutes";
import otpRoutes from "./routes/otpRoutes";
import adminRoutes from "./routes/adminRoutes";
import { v2 as cloudinary } from "cloudinary";


  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, 
  });

  


connectDB();
const app = express();

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(express.json());


app.use("/users", userRoutes); 
app.use("/tutors", tutorRoutes);
app.use("/auth", authRoutes);
app.use("/otp", otpRoutes); 
app.use("/admin", adminRoutes); 

app.use((error: any, req: Request, res: Response, next: NextFunction) =>
  handleError(error, req, res, next)
);

app.use("/", new UserRoutes().router);
export default app;
