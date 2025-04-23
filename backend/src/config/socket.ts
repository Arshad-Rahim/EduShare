import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { MessageModel } from "../models/messageModel";
import { courseModel } from "../models/courseModel";

export function initializeSocket(httpServer: HttpServer, corsOptions: any) {
  const io = new Server(httpServer, {
    cors: corsOptions, // Reuse Express CORS options for consistency
  });

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
          console.error(
            `Error saving message to community ${communityId}:`,
            err
          );
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
            console.log("SENDERID", senderId);
            console.log("UserId", userId);
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

  return io;
}
