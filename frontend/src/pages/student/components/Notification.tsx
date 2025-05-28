import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { courseService } from "@/services/courseService";

interface Notification {
  id: string;
  type: "chat_message";
  message: string;
  courseId: string;
  studentId?: string;
  tutorId?: string;
  timestamp: string;
  read: boolean;
  userId: string;
  senderId: string;
}

export function Notifications() {
  const user = useSelector((state: any) => state.user.userDatas);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // Determine user ID and role
  const userId = user?.id || user?._id;
  const isTutor = user?.role === "tutor";

  useEffect(() => {
    if (!userId) {
      console.error("No user ID in Notifications", { user });
      return;
    }
    console.log("Notifications initializing:", { userId, isTutor });

    // Initialize socket
    socketRef.current = io("https://edushare.arshadrahim.tech", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", {
        socketId: socketRef.current?.id,
        userId,
      });
      socketRef.current?.emit("join_user", userId);
      console.log("Emitted join_user:", userId);

      // Fetch enrolled courses
      courseService
        .getEnrolledCourses()
        .then((courses) => {
          console.log("Enrolled courses:", courses);
          if (!courses || courses.length === 0) {
            console.warn("No enrolled courses found for user:", userId);
          }
          courses.forEach((course: any) => {
            socketRef.current?.emit("join_community", course._id);
            console.log("Joined community:", course._id);
          });
        })
        .catch((error) => {
          console.error("Failed to fetch enrolled courses:", error);
        });
    });

    socketRef.current.on("notification", (data) => {
      const {
        type,
        message,
        courseId,
        studentId,
        tutorId,
        timestamp,
        senderId,
      } = data;
      console.log("Received notification:", {
        userId,
        senderId,
        isTutor,
        type,
        message,
        courseId,
        studentId,
        tutorId,
        timestamp,
      });

      if (userId === senderId) {
        console.log("Skipping notification for sender:", { userId, senderId });
        return;
      }

      // Check if user is on chat or community page
      const currentPath = window.location.pathname;
      const chatPageRegex = /^\/courses\/([a-f0-9]+)\/chat$/;
      const match = currentPath.match(chatPageRegex);
      const isOnChatPage = !!match;
      const chatCourseId = match ? match[1] : null;
      const isOnCommunityPage = currentPath === "/community";
      const shouldSuppressNotification =
        (isOnChatPage && chatCourseId === courseId) || isOnCommunityPage;

      console.log("Notification check:", {
        currentPath,
        isOnChatPage,
        chatCourseId,
        isOnCommunityPage,
        courseId,
        shouldSuppressNotification,
      });

      // Create notification
      const notification: Notification = {
        id: Math.random().toString(36).substring(7),
        type,
        message,
        courseId,
        studentId,
        tutorId,
        timestamp,
        read: shouldSuppressNotification,
        userId,
        senderId,
      };

      // Update notifications state
      setNotifications((prev) => {
        const newNotifications = [notification, ...prev];
        console.log("Updated notifications:", newNotifications);
        return newNotifications;
      });

      if (shouldSuppressNotification) {
        console.log("Suppressed notification toast:", { courseId });
        return;
      }

      const redirectPath = isTutor ? `/tutor/messages` : `/community`;

      toast(message, {
        description: new Date(timestamp).toLocaleString(),
        action: {
          label: "View",
          onClick: () => {
            if (!notification.read) {
              (window as any).markNotificationRead(notification.id);
            }
            navigate(redirectPath);
          },
        },
        duration: 5000,
        id: notification.id,
      });
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    socketRef.current.on("reconnect", (attempt) => {
      console.log("Socket reconnected:", {
        socketId: socketRef.current?.id,
        attempt,
        userId,
      });
      socketRef.current?.emit("join_user", userId);
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
      console.log("Cleaning up Notifications socket:", { userId });
      socketRef.current?.off("connect");
      socketRef.current?.off("notification");
      socketRef.current?.off("connect_error");
      socketRef.current?.off("reconnect");
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [userId, navigate, isTutor]);

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
    window.dispatchEvent(new Event("notifications-updated"));
  }, [notifications]);

  return null;
}
