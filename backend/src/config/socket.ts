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

  const rooms = new Map<string, string[]>();

  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_user", (userId: string) => {
      if (!userId) {
        console.error("join_user: No userId provided");
        return;
      }
      console.log(`Socket ${socket.id} joining user room ${userId}`);
      socket.join(userId);
      io.in(userId)
        .allSockets()
        .then((sockets) => {
          console.log(`Sockets in room ${userId}:`, sockets.size);
        });
    });

    socket.on("join_community", async (communityId: string) => {
      socket.join(`community_${communityId}`);
      console.log(`User ${socket.id} joined community ${communityId}`);
      io.in(`community_${communityId}`)
        .allSockets()
        .then((sockets) => {
          console.log(`Sockets in room community_${communityId}:`, sockets.size);
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
            `Message sent to community ${communityId}: ${message.content}`
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
            `Private message sent to chat ${privateChatId}: ${message.content}`
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
        image: { data: string; name: string; type: string };
        senderId: string;
      }) => {
        const { communityId, message, image, senderId } = data;

        try {
          const base64Data = image.data.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");

          const sanitizedImageName = image.name
            .replace(/[^a-zA-Z0-9-_]/g, "_")
            .replace(/\.[^/.]+$/, "");
          const publicId = `chat_images/${senderId}-${Date.now()}-${sanitizedImageName}`;

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

          const uploadResult = await new Promise<UploadApiResponse>(
            (resolve: (value: UploadApiResponse) => void, reject: (reason?: any) => void) => {
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

          const imageUrl = await createSecureUrl(
            uploadResult.public_id,
            "image"
          );

          const newMessage = new MessageModel({
            communityId,
            sender: message.sender,
            content: message.content,
            timestamp: new Date(message.timestamp),
            status: message.status,
            imageUrl,
          });
          await newMessage.save();

          io.to(`community_${communityId}`).emit("receive_message", {
            ...message,
            _id: newMessage._id.toString(),
            timestamp: newMessage.timestamp.toISOString(),
            imageUrl,
          });
          console.log(
            `Image message sent to community ${communityId}: ${imageUrl}`
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
          if (!course) {
            console.error(`Course not found: ${communityId}`);
            return;
          }
          if (!course.enrollments || course.enrollments.length === 0) {
            console.log(`No enrollments for course: ${communityId}`);
            return;
          }
          course.enrollments.forEach((userId) => {
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
                  console.log(`Sockets in room ${userIdStr}:`, sockets.size);
                });
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
              console.log(`Sockets in room ${userId}:`, sockets.size);
            });
        } catch (error) {
          console.error("Error in send_purchase_notification:", error);
        }
      }
    );

    socket.on("join room", async (roomId: string) => {
      if (!roomId) {
        console.error("join room: No roomId provided");
        return;
      }

      if (rooms.has(roomId)) {
        rooms.get(roomId)!.push(socket.id);
      } else {
        rooms.set(roomId, [socket.id]);
      }

      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);

      const otherUsers = rooms.get(roomId)!.filter((id) => id !== socket.id);
      socket.emit("all users", otherUsers);
      console.log(
        `User ${socket.id} joined room ${roomId}, other users:`,
        otherUsers
      );

      // Notify existing users in the room of the new join
      const allUsersInRoom = rooms.get(roomId)!;
      socket.to(roomId).emit("all users", allUsersInRoom);
      console.log(`Emitted all users to room ${roomId}:`, allUsersInRoom);

      const parts = roomId.split("_");
      console.log("Parsed roomId parts:", parts);
      if (parts.length !== 4 || parts[0] !== "videocall") {
        console.error(
          "Invalid roomId format:",
          roomId,
          "Expected: videocall_<courseId>_<studentId>_<tutorId>"
        );
        socket.emit("call_rejected", { message: "Invalid room ID format" });
        return;
      }

      const [, courseId, studentId, tutorId] = parts;
      if (!courseId || !studentId || !tutorId) {
        console.error("Missing roomId components:", {
          courseId,
          studentId,
          tutorId,
        });
        socket.emit("call_rejected", { message: "Invalid room ID components" });
        return;
      }

      try {
        const course = await courseModel.findById(courseId);
        if (!course) {
          console.error(`Course not found for courseId: ${courseId}`);
          socket.emit("call_rejected", { message: "Course not found" });
          return;
        }

        const tutorSockets = await io.in(tutorId).allSockets();
        console.log(
          `Sockets in tutor room ${tutorId} before emitting call_request:`,
          tutorSockets.size
        );
        if (tutorSockets.size === 0) {
          console.warn(`No sockets found in tutor room ${tutorId}`);
          socket.emit("call_rejected", { message: "Tutor not available" });
          return;
        }

        io.to(tutorId).emit("call_request", {
          roomId,
          studentId,
          courseId,
          courseTitle: course.title,
          timestamp: new Date().toISOString(),
        });
        console.log(`Sent call request to tutor ${tutorId} for room ${roomId}`);
      } catch (error) {
        console.error("Error fetching course for call request:", error);
        socket.emit("call_rejected", { message: "Failed to initiate call" });
      }
    });

    socket.on("sending signal", (payload) => {
      console.log(
        "Sending signal to:",
        payload.userToSignal,
        "from:",
        payload.callerID,
        "signal:",
        payload.signal
      );
      io.to(payload.userToSignal).emit("user joined", {
        signal: payload.signal,
        callerID: payload.callerID,
      });
    });

    socket.on("returning signal", (payload) => {
      console.log(
        "Returning signal to:",
        payload.callerID,
        "from:",
        socket.id,
        "signal:",
        payload.signal
      );
      io.to(payload.callerID).emit("receiving returned signal", {
        signal: payload.signal,
        id: socket.id,
      });
    });

    socket.on("call_rejected", ({ roomId, tutorId }) => {
      const [_, courseId, studentId] = roomId.split("_");
      io.to(studentId).emit("call_rejected", {
        message: "Tutor rejected the call",
      });
      console.log(`Tutor ${tutorId} rejected call for room ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      for (const [roomId, sockets] of rooms.entries()) {
        if (sockets.includes(socket.id)) {
          rooms.set(
            roomId,
            sockets.filter((id) => id !== socket.id)
          );
          if (rooms.get(roomId)!.length === 0) {
            rooms.delete(roomId);
          }
          io.to(roomId).emit("all users", rooms.get(roomId) || []);
          console.log(
            `Updated all users in room ${roomId} after disconnect:`,
            rooms.get(roomId)
          );
        }
      }
    });
  });

  return io;
}