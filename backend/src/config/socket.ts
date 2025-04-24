import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { MessageModel } from "../models/messageModel";
import { courseModel } from "../models/courseModel";
import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";
import { createSecureUrl } from "../util/createSecureUrl";

export function initializeSocket(httpServer: HttpServer, corsOptions: any) {
  const io = new Server(httpServer, {
    cors: corsOptions,
  });

  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

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

    socket.on(
      "join_private_chat",
      async ({
        courseId,
        studentId,
        tutorId,
      }: {
        courseId: string;
        studentId: string;
        tutorId: string;
      }) => {
        const privateChatId = `private_${courseId}_${studentId}_${tutorId}`;
        socket.join(privateChatId);
        console.log(`User ${socket.id} joined private chat ${privateChatId}`);

        try {
          const messages = await MessageModel.find({ privateChatId })
            .sort({ timestamp: 1 })
            .limit(50);
          socket.emit("private_message_history", messages);
          console.log(`Sent private message history for chat ${privateChatId}`);
        } catch (err) {
          console.error(
            `Error fetching private message history for chat ${privateChatId}:`,
            err
          );
        }
      }
    );

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
          const newMessage = new MessageModel({
            communityId,
            sender: message.sender,
            content: message.content,
            timestamp: new Date(message.timestamp),
            status: message.status,
          });
          await newMessage.save();

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
      "send_private_message",
      async (data: {
        courseId: string;
        studentId: string;
        tutorId: string;
        message: {
          sender: string;
          content: string;
          timestamp: string;
          status: string;
        };
      }) => {
        const { courseId, studentId, tutorId, message } = data;
        const privateChatId = `private_${courseId}_${studentId}_${tutorId}`;

        try {
          const newMessage = new MessageModel({
            privateChatId,
            sender: message.sender,
            content: message.content,
            timestamp: new Date(message.timestamp),
            status: message.status,
          });
          await newMessage.save();

          io.to(privateChatId).emit("receive_private_message", {
            ...message,
            _id: newMessage._id.toString(),
            timestamp: newMessage.timestamp.toISOString(),
          });
          console.log(
            `Private message saved and sent to chat ${privateChatId}: ${message.content}`
          );
        } catch (err) {
          console.error(
            `Error saving private message to chat ${privateChatId}:`,
            err
          );
        }
      }
    );

    socket.on(
      "send_image_message",
      async (data: {
        communityId: string;
        message: {
          sender: string;
          content: string;
          timestamp: string;
          status: string;
        };
        image: {
          data: string;
          name: string;
          type: string;
        };
        senderId: string;
      }) => {
        const { communityId, message, image, senderId } = data;

        try {
          // Decode base64 image data
          const base64Data = image.data.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");

          // Sanitize image name to create a safe public_id
          const sanitizedImageName = image.name
            .replace(/[^a-zA-Z0-9-_]/g, "_")
            .replace(/\.[^/.]+$/, "");
          const publicId = `chat_images/${senderId}-${Date.now()}-${sanitizedImageName}`;

          // Generate signature including public_id
          const timestamp = Math.round(new Date().getTime() / 1000);
          const signatureParams = {
            timestamp,
            folder: "chat_images",
            access_mode: "authenticated",
            public_id: publicId,
          };
          console.log("Signature parameters:", signatureParams);
          const signature = cloudinary.utils.api_sign_request(
            signatureParams,
            process.env.CLOUDINARY_API_SECRET as string
          );

          // Upload to Cloudinary
          const uploadResult = await new Promise<UploadApiResponse>(
            (resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                {
                  resource_type: "image",
                  folder: "chat_images",
                  access_mode: "authenticated",
                  timestamp,
                  signature,
                  api_key: process.env.CLOUDINARY_API_KEY as string,
                  public_id: publicId,
                },
                (error, result) => {
                  if (error) return reject(error);
                  resolve(result as UploadApiResponse);
                }
              );
              stream.end(buffer);
            }
          );

          console.log(
            "Uploaded Secure Image Public ID:",
            uploadResult.public_id
          );

          // Generate secure URL
          const imageUrl = await createSecureUrl(
            uploadResult.public_id,
            "image"
          );

          // Save message with image URL
          const newMessage = new MessageModel({
            communityId,
            sender: message.sender,
            content: message.content,
            timestamp: new Date(message.timestamp),
            status: message.status,
            imageUrl,
          });
          await newMessage.save();

          // Broadcast message to community
          io.to(`community_${communityId}`).emit("receive_message", {
            ...message,
            _id: newMessage._id.toString(),
            timestamp: newMessage.timestamp.toISOString(),
            imageUrl,
          });
          console.log(
            `Image message saved and sent to community ${communityId}: ${imageUrl}`
          );
        } catch (err) {
          console.error(
            `Error saving image message to community ${communityId}:`,
            err
          );
          socket.emit("error", { message: "Failed to upload image" });
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
                senderId,
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

    socket.on(
      "send_purchase_notification",
      async ({ userId, courseId, courseTitle }) => {
        try {
          console.log("Received send_purchase_notification:", {
            userId,
            courseId,
            courseTitle,
          });
          const course = await courseModel.findById(courseId);
          if (!course) {
            console.error(`Course not found: ${courseId}`);
            return;
          }
          io.to(userId).emit("notification", {
            type: "course_purchase",
            message: `You have successfully enrolled in ${courseTitle}!`,
            courseId,
            timestamp: new Date().toISOString(),
            senderId: userId,
          });
          console.log(
            `Sent purchase notification to user ${userId} for course ${courseId}`
          );
          io.in(userId)
            .allSockets()
            .then((sockets) => {
              console.log(`Sockets in room ${userId}:`, sockets);
            });
        } catch (error) {
          console.error("Error in send_purchase_notification:", error);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}