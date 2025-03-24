"use client";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Bell, MessageSquare, ChevronDown, BookOpen, Menu } from "lucide-react";
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
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { removeUser } from "@/redux/slice/userSlice";
import { toast } from "sonner";

// Define notification type
interface Notification {
  _id: string;
  type: "approval" | "rejection";
  message: string;
  reason?: string; // Optional rejection reason
  createdAt: string;
  read?: boolean; // Add read field
}

export function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await authAxiosInstance.get("/tutors/notifications");
        console.log("RESPONSE", response);

        // Handle both single object and array cases
        const fetchedNotifications = response.data.notifications;
        const notificationsArray = Array.isArray(fetchedNotifications)
          ? fetchedNotifications
          : [fetchedNotifications]; // Convert single object to array

        setNotifications(notificationsArray);
        setUnreadCount(
          notificationsArray.filter((n: Notification) => !n.read).length
        );
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        toast.error("Could not load notifications");
      }
    };
    fetchNotifications();
  }, []);

  const handleSignOut = () => {
    authAxiosInstance
      .post("/auth/logout")
      .then((response) => {
        toast.success(response.data.message);
        localStorage.removeItem("userData");
        dispatch(removeUser());
        navigate("/auth");
      })
      .catch((error) => {
        console.error("Logout failed:", error);
        toast.error("Failed to sign out");
      });
  };

  const handleMyAccount = () => {
    navigate("/tutor/profileDetails");
  };

  const handleUpdateProfile = () => {
    navigate("/tutor/profileDetails"); // Redirect to profile update page
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between space-x-4 sm:space-x-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TechLearn</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification._id}
                    className="flex flex-col items-start p-2"
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
                            onClick={handleUpdateProfile}
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

          <Button variant="outline" size="icon">
            <MessageSquare className="h-4 w-4" />
          </Button>

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
                  <span>Dr. Ryan Miller</span>
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
              <DropdownMenuItem>Earnings</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
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
