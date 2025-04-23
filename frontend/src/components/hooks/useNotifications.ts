import { useState, useEffect } from "react";

interface Notification {
  id: string;
  type: string;
  message: string;
  courseId: string;
  timestamp: string;
  read: boolean;
  userId: string;
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Initial fetch of notifications
    const updateNotifications = () => {
      const currentNotifications = ((window as any).notifications || []).filter(
        (n: Notification) => n.userId === userId
      );
      setNotifications(currentNotifications);
    };

    // Update immediately on mount
    updateNotifications();

    // Poll for changes to window.notifications (simple approach)
    const interval = setInterval(updateNotifications, 500);

    // Alternative: Use a custom event for more efficiency
    const handleNotificationUpdate = () => updateNotifications();
    window.addEventListener("notifications-updated", handleNotificationUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "notifications-updated",
        handleNotificationUpdate
      );
    };
  }, [userId]);

  return notifications;
}
