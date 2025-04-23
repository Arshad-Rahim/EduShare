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
import progressRoutes from "./routes/progressRoutes";
import { courseModel } from "./models/courseModel";

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
app.use("/progress", progressRoutes);

// Error handling middleware
app.use((error: CustomError, req: Request, res: Response, next: NextFunction) =>
  handleError(error, req, res, next)
);

// Socket.IO logic for community-based chat
io.on("connection", (socket: Socket) => {
 console.log(`User connected: ${socket.id}`);

  // Handle joining a user-specific room
socket.on("join_user", (userId: string) => {
  console.log(
    `Received join_user event for user ${userId} from socket ${socket.id}`
  );
  socket.join(userId);
  console.log(`Socket ${socket.id} joined user room ${userId}`);
  io.in(userId)
    .allSockets()
    .then((sockets) => {
      console.log(`Sockets in room ${userId} after join:`, sockets);
    });
});

socket.on("join_community", async (communityId: string) => {
  socket.join(`community_${communityId}`);
  console.log(`User ${socket.id} joined community ${communityId}`);
  io.in(`community_${communityId}`)
    .allSockets()
    .then((sockets) => {
      console.log(
        `Sockets in room community_${communityId} after join:`,
        sockets
      );
    });

  try {
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

socket.on(
  "send_notification",
  async ({ communityId, courseTitle, message, senderId }) => {
    try {
      console.log("Received send_notification:", {
        communityId,
        courseTitle,
        senderId,
        message,
      });
      const course = await courseModel.findById(communityId);
      console.log("Found course:", course);
      if (!course) {
        console.error(`Course not found: ${communityId}`);
        return;
      }
      if (!course.enrollments || course.enrollments.length === 0) {
        console.log(`No enrollments for course: ${communityId}`);
        return;
      }
      course.enrollments.forEach((userId) => {
        console.log("SENDERID",senderId)
        console.log("UserId",userId)
        const userIdStr = userId.toString();
        if (userIdStr !== senderId) {
          console.log(
            `Emitting notification to user ${userIdStr} for course ${communityId}`
          );
          io.to(userIdStr).emit("notification", {
            type: "chat_message",
            message: `New message in ${courseTitle} community: ${message.content.slice(0, 50)}...`,
            courseId: communityId,
            timestamp: new Date().toISOString(),
            senderId, // Include senderId in the payload
          });
          io.in(userIdStr)
            .allSockets()
            .then((sockets) => {
              console.log(`Sockets in room ${userIdStr}:`, sockets);
            });
        } else {
          console.log(
            `Skipping sender ${userIdStr} (matches senderId: ${senderId})`
          );
        }
      });
    } catch (error) {
      console.error("Error in send_notification:", error);
    }
  }
);
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

export { app, httpServer };
