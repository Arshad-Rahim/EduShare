import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { courseService } from "@/services/courseService/courseService";

interface Notification {
  id: string;
  type: "chat_message";
  message: string;
  courseId: string;
  timestamp: string;
  read: boolean;
  userId: string;
}

export function Notifications() {
  const user = useSelector((state: any) => state.user.userDatas);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // Determine user ID, checking both user.id and user._id
  const userId = user?.id || user?._id;

  useEffect(() => {
    if (!userId) {
      console.error("No user ID (id or _id) in Notifications", { user });
      return;
    }
    console.log("Notifications user ID:", userId, { user });

    socketRef.current = io("http://localhost:3000", { reconnection: true });

    socketRef.current.on("connect", () => {
      console.log("Socket.IO connected:", socketRef.current?.id);
      socketRef.current?.emit("join_user", userId);
      console.log("Emitted join_user:", userId);

      courseService
        .getEnrolledCourses()
        .then((courses) => {
          console.log("Enrolled courses:", courses);
          courses.forEach((course: any) => {
            socketRef.current?.emit("join_community", course._id);
            console.log("Joined community:", course._id);
          });
        })
        .catch((error) => {
          console.error("Failed to fetch enrolled courses:", error);
        });
    });

    socketRef.current.on(
      "notification",
      ({ type, message, courseId, timestamp, senderId }) => {
        if (userId === senderId) {
          console.log("Skipping notification for sender:", userId);
          return;
        }

        console.log(
          "Received notification for user:",
          userId,
          "Socket ID:",
          socketRef.current?.id
        );
        console.log("Notification details:", {
          type,
          message,
          courseId,
          timestamp,
          senderId,
        });
        const notification: Notification = {
          id: Math.random().toString(36).substring(7),
          type,
          message,
          courseId,
          timestamp,
          read: false,
          userId: userId,
        };
        setNotifications((prev) => {
          const newNotifications = [notification, ...prev];
          console.log("New notifications state:", newNotifications);
          return newNotifications;
        });

        toast(message, {
          description: new Date(timestamp).toLocaleString(),
          action: {
            label: "View",
            onClick: () => {
              if (!notification.read) {
                (window as any).markNotificationRead(notification.id);
              }
              navigate(`/community`);
            },
          },
          duration: 5000,
          id: notification.id,
        });
      }
    );

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
    });

    socketRef.current.on("reconnect", () => {
      console.log("Socket.IO reconnected:", socketRef.current?.id);
      socketRef.current?.emit("join_user", userId);
      console.log("Re-emitted join_user:", userId);

      courseService
        .getEnrolledCourses()
        .then((courses) => {
          console.log("Enrolled courses on reconnect:", courses);
          courses.forEach((course: any) => {
            socketRef.current?.emit("join_community", course._id);
            console.log("Re-joined community:", course._id);
          });
        })
        .catch((error) => {
          console.error(
            "Failed to fetch enrolled courses on reconnect:",
            error
          );
        });
    });

    return () => {
      socketRef.current?.off("connect");
      socketRef.current?.off("notification");
      socketRef.current?.off("connect_error");
      socketRef.current?.off("reconnect");
      socketRef.current?.disconnect();
      console.log("Socket.IO disconnected");
    };
  }, [userId, navigate]);

  useEffect(() => {
    (window as any).notifications = notifications;
    (window as any).markNotificationRead = (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    };
    (window as any).clearNotifications = () => {
      setNotifications([]);
    };
    console.log("Updated window.notifications:", notifications);
    // Dispatch custom event to notify listeners
    window.dispatchEvent(new Event("notifications-updated"));
  }, [notifications]);

  return null;
}
