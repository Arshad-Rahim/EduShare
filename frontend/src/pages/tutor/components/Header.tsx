import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Bell, MessageSquare, ChevronDown, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { removeUser } from "@/redux/slice/userSlice";
import { toast } from "sonner";
import { tutorService } from "@/services/tutorService/tutorService";
import { io, Socket } from "socket.io-client";

// Define notification type for profile updates
interface ProfileNotification {
  _id: string;
  type: "approval" | "rejection";
  message: string;
  reason?: string;
  createdAt: string;
  read?: boolean;
}

// Define notification type for private chat messages
interface ChatNotification {
  _id?: string;
  type: "chat_message";
  message: string;
  courseId: string;
  studentId: string;
  courseTitle: string;
  timestamp: string;
  senderId: string;
  read?: boolean;
}

export function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profileNotifications, setProfileNotifications] = useState<
    ProfileNotification[]
  >([]);
  const [chatNotifications, setChatNotifications] = useState<
    ChatNotification[]
  >([]);
  const [unreadProfileCount, setUnreadProfileCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [chatDropdownOpen, setChatDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await tutorService.tutorDetails();
        setUser({
          name: response?.data.tutor.name,
          email: response?.data.tutor.email,
        });
        setIsAccepted(response?.data.tutor.isAccepted);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        toast.error("Failed to load user data");
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (isAccepted === false) {
      toast.info(
        "Please complete your profile verification to access all features.",
        {
          action: {
            label: "Update Profile",
            onClick: () => navigate("/tutor/profileDetails"),
          },
          duration: 10000,
          closeButton: true,
        }
      );
    }
  }, [isAccepted, navigate]);

  // Fetch profile notifications
  useEffect(() => {
    fetchProfileNotifications();
  }, []);

  const fetchProfileNotifications = async () => {
    try {
      const response = await tutorService.fetchNotification();
      const fetchedNotifications = response?.data.notifications;
      const notificationsArray = Array.isArray(fetchedNotifications)
        ? fetchedNotifications
        : [fetchedNotifications];
      setProfileNotifications(notificationsArray);
      setUnreadProfileCount(
        notificationsArray.filter((n: ProfileNotification) => !n.read).length
      );
    } catch (error) {
      console.error("Failed to fetch profile notifications:", error);
    }
  };

  // Socket.IO setup for chat notifications
  useEffect(() => {
    if (!user) return;

    socketRef.current = io("https://edushare.arshadrahim.tech", {
      reconnection: true,
    });

    socketRef.current.emit("join_user", user.email); // Join user room using email or tutorId

    socketRef.current.on("notification", (notification: ChatNotification) => {
      if (notification.type === "chat_message") {
        setChatNotifications((prev) => [
          { ...notification, read: false },
          ...prev.slice(0, 4), // Keep only the latest 5 notifications
        ]);
        setUnreadChatCount((prev) => prev + 1);
      }
    });

    return () => {
      socketRef.current?.off("notification");
      socketRef.current?.disconnect();
    };
  }, [user]);

  // Mark a single profile notification as read
  const markProfileNotificationAsRead = async (notificationId: string) => {
    try {
      await tutorService.markNotifiactionAsRead(notificationId);
      setProfileNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadProfileCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark profile notification as read:", error);
    }
  };

  // Mark all profile notifications as read
  const markAllProfileNotificationsAsRead = async () => {
    try {
      await tutorService.markAllNotificationAsRead();
      setProfileNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
      setUnreadProfileCount(0);
      toast.success("All profile notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all profile notifications as read:", error);
    }
  };

  // Mark a single chat notification as read
  const markChatNotificationAsRead = (courseId: string, studentId: string) => {
    setChatNotifications((prev) =>
      prev.map((notification) =>
        notification.courseId === courseId &&
        notification.studentId === studentId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadChatCount((prev) => Math.max(0, prev - 1));
    socketRef.current?.emit("mark_private_message_notification_as_read", {
      courseId,
      studentId,
      tutorId: user?.email, // Use tutorId or email
    });
  };

  // Handle profile dropdown open/close
  const handleProfileDropdownOpenChange = (open: boolean) => {
    setProfileDropdownOpen(open);
    if (!open && unreadProfileCount > 0) {
      markAllProfileNotificationsAsRead();
    }
  };

  // Handle chat dropdown open/close
  const handleChatDropdownOpenChange = (open: boolean) => {
    setChatDropdownOpen(open);
  };

  // Handle click on a profile notification
  const handleProfileNotificationClick = (notificationId: string) => {
    markProfileNotificationAsRead(notificationId);
  };

  // Handle click on a chat notification
  const handleChatNotificationClick = (courseId: string, studentId: string) => {
    markChatNotificationAsRead(courseId, studentId);
    navigate(`/tutor/messages/${courseId}/${studentId}`);
  };

  const handleSignOut = async () => {
    try {
      const response = await tutorService.logoutTutor();
      toast.success(response?.data.message);
      localStorage.removeItem("userData");
      dispatch(removeUser());
      navigate("/auth");
    } catch (error) {
      console.error("Failed to sign out:", error);
      toast.error("Failed to sign out");
    }
  };

  const handleMyAccount = () => {
    navigate("/tutor/profileDetails");
  };

  const handleUpdateProfile = () => {
    navigate("/tutor/profileDetails");
  };

  const handleWallet = () => {
    navigate("/tutor/wallet");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between space-x-4 sm:space-x-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TechLearn</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <DropdownMenu
            onOpenChange={handleProfileDropdownOpenChange}
            open={profileDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadProfileCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {unreadProfileCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                {unreadProfileCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllProfileNotificationsAsRead();
                    }}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              {profileNotifications.length > 0 ? (
                profileNotifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification._id}
                    className={`flex flex-col items-start p-2 ${
                      !notification.read ? "bg-muted/50" : ""
                    }`}
                    onClick={() =>
                      handleProfileNotificationClick(notification._id)
                    }
                  >
                    <span className="text-sm font-medium">
                      {notification.type === "approval"
                        ? "Profile Approved"
                        : "Profile Rejected"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {notification.message}
                    </span>
                    {notification.type === "rejection" &&
                      notification.reason && (
                        <>
                          <span className="text-xs text-red-600 mt-1">
                            Reason: {notification.reason}
                          </span>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-blue-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateProfile();
                            }}
                          >
                            Update Profile
                          </Button>
                        </>
                      )}
                    <span className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  No new notifications
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Messages Icon */}
          <DropdownMenu
            onOpenChange={handleChatDropdownOpenChange}
            open={chatDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <MessageSquare className="h-4 w-4" />
                {unreadChatCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {unreadChatCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2">
                <DropdownMenuLabel>Messages</DropdownMenuLabel>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/tutor/messages");
                  }}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  View all messages
                </Button>
              </div>
              <DropdownMenuSeparator />
              {chatNotifications.length > 0 ? (
                chatNotifications.map((notification) => (
                  <DropdownMenuItem
                    key={`${notification.courseId}-${notification.studentId}`}
                    className={`flex flex-col items-start p-2 ${
                      !notification.read ? "bg-muted/50" : ""
                    }`}
                    onClick={() =>
                      handleChatNotificationClick(
                        notification.courseId,
                        notification.studentId
                      )
                    }
                  >
                    <span className="text-sm font-medium">
                      {notification.courseTitle}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {notification.message}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  No new messages
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32&text=T"
                    alt="@tutor"
                  />
                  <AvatarFallback>T</AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start text-sm md:flex">
                  <span>{user?.name}</span>
                  <span className="text-xs text-muted-foreground">Tutor</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleMyAccount}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleWallet}>Wallet</DropdownMenuItem>
              {/* <DropdownMenuItem>Earnings</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
