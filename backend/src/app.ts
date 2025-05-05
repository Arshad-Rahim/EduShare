import dotenv from "dotenv";
dotenv.config();

import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { connectDB } from "./config/connectDB";
import userRoutes from "./routes/userRoutes";
import { corsOptions } from "./middleware/corsOptionConfiguration";
import { handleError } from "./middleware/errorHandlingMiddleware";
import tutorRoutes from "./routes/tutorRoutes";
import authRoutes from "./routes/authRoutes";
import otpRoutes from "./routes/otpRoutes";
import adminRoutes from "./routes/adminRoutes";
import { v2 as cloudinary } from "cloudinary";
import { CustomError } from "./util/CustomError";
import morgan from "morgan";
import courseRoutes from "./routes/courseRoutes";
import lessonRoutes from "./routes/lessonRoutes";
import wishlistRoute from "./routes/wishlistRoute";
import paymentRoutes from "./routes/paymentRoutes";
import purchaseRoutes from "./routes/purchaseRoutes";
import progressRoutes from "./routes/progressRoutes";
import { initializeSocket } from "./config/socket";
import walletRoutes from "./routes/walletRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import { S3Client } from "@aws-sdk/client-s3";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export const s3 = s3Client;

connectDB();

const app: Express = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer, corsOptions);

// Middleware
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/tutors", tutorRoutes);
app.use("/auth", authRoutes);
app.use("/otp", otpRoutes);
app.use("/admin", adminRoutes);
app.use("/courses", courseRoutes);
app.use("/lessons", lessonRoutes);
app.use("/wishlist", wishlistRoute);
app.use("/payment", paymentRoutes);
app.use("/purchase", purchaseRoutes);
app.use("/progress", progressRoutes);
app.use("/wallet", walletRoutes);
app.use("/transaction", transactionRoutes);

// Error handling middleware
app.use((error: CustomError, req: Request, res: Response, next: NextFunction) =>
  handleError(error, req, res, next)
);

export { app, httpServer };
