import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { MessageModel } from "../models/messageModel";
import { courseModel } from "../models/courseModel";
import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";
import { createSecureUrl } from "../util/createSecureUrl";
import { userModel } from "../models/userModels";
import { s3 } from "../app";
import { ObjectCannedACL, PutObjectCommand } from "@aws-sdk/client-s3";

export function initializeSocket(httpServer: HttpServer, corsOptions: any) {
  const io = new Server(httpServer, {
    cors: corsOptions,
  });

  const rooms = new Map<string, string[]>();

  const fetchPrivateChats = async (tutorId: string, socket: Socket) => {
    try {
      console.log(`Fetching private chats for tutor ${tutorId}`);
      const messages = await MessageModel.find({
        privateChatId: { $regex: `private_.*_.*_${tutorId}$` },
      })
        .sort({ timestamp: -1 })
        .lean();

      console.log(`Found ${messages.length} messages for tutor ${tutorId}`);

      const chats: any[] = [];
      const uniqueChatIds = [
        ...new Set(messages.map((msg) => msg.privateChatId)),
      ];
      console.log(`Unique chat IDs: ${uniqueChatIds}`);

      for (const privateChatId of uniqueChatIds) {
        if (privateChatId) {
          const [_, courseId, studentId] = privateChatId?.split("_");
          const latestMessage = messages.find(
            (msg) => msg.privateChatId === privateChatId
          );

          const course = await courseModel.findById(courseId).lean();
          const student = await userModel.findById(studentId).lean();

          console.log(`Processing chat ${privateChatId}:`, {
            courseId,
            studentId,
            courseFound: !!course,
            studentFound: !!student,
            latestMessage: latestMessage?.content || "No content",
          });

          if (course && student && latestMessage) {
            chats.push({
              privateChatId,
              courseId,
              studentId,
              courseTitle: course.title || "Unknown Course",
              studentName: student.name || "Unknown Student",
              latestMessage: {
                content: latestMessage.content || "",
                timestamp: latestMessage.timestamp.toISOString(),
                imageUrl: latestMessage.imageUrl || undefined,
              },
            });
          }
        }
      }

      // Sort chats by latest message timestamp
      chats.sort(
        (a, b) =>
          new Date(b.latestMessage.timestamp).getTime() -
          new Date(a.latestMessage.timestamp).getTime()
      );

      console.log(`Sending ${chats.length} chats to tutor ${tutorId}:`, chats);
      socket.emit("private_chats", { chats });
      console.log(`Sent private chats to tutor ${tutorId}`);
    } catch (err) {
      console.error(`Error fetching private chats for tutor ${tutorId}:`, err);
      socket.emit("error", { message: "Failed to fetch private chats" });
    }
  };

  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_user", (userId: string, callback?: () => void) => {
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
          if (callback) callback();
        });
    });

    socket.on("join_community", async (communityId: string) => {
      socket.join(`community_${communityId}`);
      console.log(`User ${socket.id} joined community ${communityId}`);
      io.in(`community_${communityId}`)
        .allSockets()
        .then((sockets) => {
          console.log(
            `Sockets in room community_${communityId}:`,
            sockets.size
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
      "fetch_private_chats",
      async ({ tutorId }: { tutorId: string }) => {
        await fetchPrivateChats(tutorId, socket);
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
          senderId?: string;
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

          const course = await courseModel.findById(courseId).lean();
          const student = await userModel.findById(studentId).lean();

          io.to(privateChatId).emit("receive_private_message", {
            ...message,
            _id: newMessage._id.toString(),
            timestamp: newMessage.timestamp.toISOString(),
            courseId,
            studentId,
            tutorId,
            courseTitle: course?.title || "Unknown Course",
            studentName: student?.name || "Unknown Student",
          });
          console.log(
            `Private message sent to chat ${privateChatId}: ${message.content}`
          );

          // Derive senderId based on the sender's role
          let senderId: string;
          const tutor = await userModel.findById(tutorId).lean();
          if (!tutor) {
            console.error(`Tutor not found for tutorId: ${tutorId}`);
            return;
          }
          const tutorName = tutor.name || "Unknown Tutor";
          if (message.sender.toLowerCase() === tutorName.toLowerCase()) {
            senderId = tutorId;
          } else {
            senderId = studentId;
          }

          // Notify the recipient (not the sender)
          const recipientId = senderId === tutorId ? studentId : tutorId;
          if (recipientId) {
            io.to(recipientId).emit("notification", {
              type: "chat_message",
              message: `${message.sender} sent a message: ${message.content.slice(0, 50)}...`,
              courseId,
              studentId,
              tutorId,
              courseTitle: course?.title || "Unknown Course",
              timestamp: new Date().toISOString(),
              senderId,
            });
            console.log(`Sent notification to ${recipientId} from ${senderId}`);

            // Update the tutor's chat list
            if (recipientId === tutorId) {
              io.to(tutorId).emit("fetch_private_chats", { tutorId });
              console.log(`Triggered fetch_private_chats for tutor ${tutorId}`);
            }
          }
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
          const key = `chat_images/${senderId}-${Date.now()}-${sanitizedImageName}.${image.type.split("/")[1]}`;

          const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET as string,
            Key: key,
            Body: buffer,
            ContentType: image.type,
            ACL: ObjectCannedACL.private,
          };

          await s3.send(new PutObjectCommand(uploadParams));
          console.log("Uploaded to S3 with Key:", key);

          const imageUrl = await createSecureUrl(key, "image");

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
      "send_private_image_message",
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
        image: { data: string; name: string; type: string };
        senderId: string;
      }) => {
        const { courseId, studentId, tutorId, message, image, senderId } = data;
        const privateChatId = `private_${courseId}_${studentId}_${tutorId}`;

        try {
          const base64Data = image.data.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");

          const sanitizedImageName = image.name
            .replace(/[^a-zA-Z0-9-_]/g, "_")
            .replace(/\.[^/.]+$/, "");
          const key = `chat_images/${senderId}-${Date.now()}-${sanitizedImageName}.${image.type.split("/")[1]}`;

          const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET as string,
            Key: key,
            Body: buffer,
            ContentType: image.type,
            ACL: ObjectCannedACL.private,
          };

          await s3.send(new PutObjectCommand(uploadParams));
          console.log("Uploaded to S3 with Key:", key);

          const imageUrl = await createSecureUrl(key, "image");

          const newMessage = new MessageModel({
            privateChatId,
            sender: message.sender,
            content: message.content,
            timestamp: new Date(message.timestamp),
            status: message.status,
            imageUrl,
          });
          await newMessage.save();

          const course = await courseModel.findById(courseId).lean();
          const student = await userModel.findById(studentId).lean();

          io.to(privateChatId).emit("receive_private_message", {
            ...message,
            _id: newMessage._id.toString(),
            timestamp: newMessage.timestamp.toISOString(),
            imageUrl,
            courseId,
            studentId,
            tutorId,
            courseTitle: course?.title || "Unknown Course",
            studentName: student?.name || "Unknown Student",
          });
          console.log(
            `Image message sent to private chat ${privateChatId}: ${imageUrl}`
          );

          const recipientId = senderId === tutorId ? studentId : tutorId;
          if (recipientId) {
            io.to(recipientId).emit("notification", {
              type: "chat_message",
              message: `${message.sender} sent an image in ${course?.title || "course"}`,
              courseId,
              studentId,
              tutorId,
              courseTitle: course?.title || "Unknown Course",
              timestamp: new Date().toISOString(),
              senderId,
            });
            console.log(`Sent notification to ${recipientId} from ${senderId}`);

            // Update the tutor's chat list
            if (recipientId === tutorId) {
              io.to(tutorId).emit("fetch_private_chats", { tutorId });
              console.log(`Triggered fetch_private_chats for tutor ${tutorId}`);
            }
          }
        } catch (err) {
          console.error(
            `Error saving image message to private chat ${privateChatId}:`,
            err
          );
          socket.emit("error", { message: "Failed to upload image" });
        }
      }
    );

    socket.on(
      "mark_private_message_notification_as_read",
      async ({
        courseId,
        studentId,
        tutorId,
      }: {
        courseId: string;
        studentId: string;
        tutorId: string;
      }) => {
        try {
          console.log(
            `Marked notification as read for tutor ${tutorId}, course ${courseId}, student ${studentId}`
          );
        } catch (err) {
          console.error("Error marking notification as read:", err);
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
