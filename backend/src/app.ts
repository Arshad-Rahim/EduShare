import dotenv from "dotenv";
dotenv.config();

import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
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
import { MessageModel } from "./models/messageModel";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

connectDB();

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions, // Reuse Express CORS options for consistency
});

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

// Error handling middleware
app.use((error: CustomError, req: Request, res: Response, next: NextFunction) =>
  handleError(error, req, res, next)
);

// Socket.IO logic for community-based chat
io.on("connection", (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle joining a community
  socket.on("join_community", async (communityId: string) => {
    socket.join(`community_${communityId}`);
    console.log(`User ${socket.id} joined community ${communityId}`);

    try {
      // Fetch the last 50 messages for the community from MongoDB
      const messages = await MessageModel.find({ communityId })
        .sort({ timestamp: 1 })
        .limit(50);
      socket.emit("message_history", messages);
      console.log(`Sent message history for community ${communityId}`);
    } catch (err) {
      console.error(
        `Error fetching message history for community ${communityId}:`,
        err
      );
    }
  });

  // Handle sending a message
  socket.on(
    "send_message",
    async (data: {
      communityId: string;
      message: {
        sender: string;
        content: string;
        timestamp: string;
        status: string;
      };
    }) => {
      const { communityId, message } = data;

      try {
        // Save the message to MongoDB
        const newMessage = new MessageModel({
          communityId,
          sender: message.sender,
          content: message.content,
          timestamp: new Date(message.timestamp),
          status: message.status,
        });
        await newMessage.save();

        // Broadcast the saved message to the community
        io.to(`community_${communityId}`).emit("receive_message", {
          ...message,
          _id: newMessage._id.toString(),
          timestamp: newMessage.timestamp.toISOString(),
        });
        console.log(
          `Message saved and sent to community ${communityId}: ${message.content}`
        );
      } catch (err) {
        console.error(`Error saving message to community ${communityId}:`, err);
      }
    }
  );

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

export { app, httpServer };
