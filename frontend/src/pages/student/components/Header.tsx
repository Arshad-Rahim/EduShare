import { Input } from "@/components/ui/input";
import { removeUser } from "@/redux/slice/userSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Search,
  User,
  X,
  Bell,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Link as RouterLink } from "react-router-dom";
import { profileService } from "@/services/userService/profileService";
import { userAuthService } from "@/services/userService/authUser";

interface Notification {
  id: string;
  type: string;
  message: string;
  courseId: string;
  timestamp: string;
  read: boolean;
  userId: string;
}

export function Header() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: any) => state.user.userDatas);

  // Determine user ID, checking both currentUser.id and currentUser._id
  const userId = currentUser?.id || currentUser?._id;

  // Log userId and currentUser for debugging
  useEffect(() => {
    console.log("Header user ID:", userId, { currentUser });
  }, [userId, currentUser]);

  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>(
    ((window as any).notifications || []).filter(
      (n: Notification) => n.userId === userId
    )
  );
  const markNotificationRead = (window as any).markNotificationRead;
  const clearNotifications = (window as any).clearNotifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Listen for notifications-updated event
  useEffect(() => {
    const handleNotificationsUpdated = () => {
      console.log(
        "Notifications updated event received:",
        (window as any).notifications
      );
      setNotifications(
        ((window as any).notifications || []).filter(
          (n: Notification) => n.userId === userId
        )
      );
    };

    window.addEventListener(
      "notifications-updated",
      handleNotificationsUpdated
    );

    return () => {
      window.removeEventListener(
        "notifications-updated",
        handleNotificationsUpdated
      );
    };
  }, [userId]);

  useEffect(() => {
    const fetchUserMe = async () => {
      try {
        const response = await profileService.userDetails();
        setUser({
          name: response.data.users.name,
          email: response.data.users.email,
        });
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUserMe();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await userAuthService.logoutUser();
      toast.success(response.data.message);
      localStorage.removeItem("userData");
      dispatch(removeUser());
      clearNotifications?.();
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to sign out");
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markNotificationRead(notification.id);
    }
    navigate(`/community`);
    setIsNotificationOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            EduShare
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:gap-6">
          <RouterLink
            to="/"
            className="text-sm font-medium text-primary hover:underline"
          >
            Home
          </RouterLink>
          <RouterLink
            to="/courses"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:underline"
          >
            Courses
          </RouterLink>
          <RouterLink
            to="/paths"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:underline"
          >
            Paths
          </RouterLink>
          <RouterLink
            to="/community"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:underline"
          >
            Community
          </RouterLink>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <form className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="w-[200px] pl-8 md:w-[250px] lg:w-[300px]"
              />
            </div>
          </form>

          {user ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative hover:bg-muted/50 rounded-full"
                  aria-label={`Notifications, ${unreadCount} unread`}
                >
                  <Bell className="h-5 w-5 text-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
                {isNotificationOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-muted/50 bg-background shadow-xl ring-1 ring-black/5 z-50">
                    <div className="flex justify-between items-center p-4 border-b border-muted/20">
                      <h3 className="font-semibold text-foreground text-sm">
                        Notifications
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsNotificationOpen(false)}
                        className="text-muted-foreground hover:bg-muted/50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">
                          No notifications
                        </p>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors duration-150 ${
                              notification.read
                                ? "bg-muted/20"
                                : "bg-background"
                            }`}
                          >
                            <p className="text-sm text-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                notification.timestamp
                              ).toLocaleString()}
                            </p>
                            {!notification.read && (
                              <Check className="h-4 w-4 text-green-500 mt-1" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-4 border-t border-muted/20">
                        <Button
                          variant="ghost"
                          className="w-full text-sm text-primary hover:text-primary/80"
                          onClick={() => {
                            clearNotifications();
                            setIsNotificationOpen(false);
                          }}
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 rounded-lg transition-colors duration-200"
                >
                  <Avatar className="h-8 w-8 border border-muted">
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32&text=U"
                      alt={user.name}
                    />
                    <AvatarFallback className="bg-muted text-foreground font-medium">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-start text-sm md:flex">
                    <span className="font-semibold text-foreground">
                      {user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:rotate-180" />
                </Button>
                <div className="absolute right-0 top-full mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out transform group-hover:scale-100 scale-95 origin-top-right z-50">
                  <div className="rounded-xl border border-muted/50 bg-background p-2 shadow-xl ring-1 ring-black/5">
                    <div className="px-3 py-2 border-b border-muted/20">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-sm">
                          {user.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => navigate("/profile")}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/70 rounded-md transition-colors duration-150"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        Profile
                      </button>
                      <button
                        onClick={() => navigate("/wishlist")}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/70 rounded-md transition-colors duration-150"
                      >
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        Wishlist
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors duration-150"
                      >
                        <LogOut className="h-4 w-4 text-destructive" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden md:inline-flex"
              >
                <RouterLink to="/auth">Log in</RouterLink>
              </Button>
              <Button size="sm" asChild className="hidden md:inline-flex">
                <RouterLink to="/auth">Sign up</RouterLink>
              </Button>
            </>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="px-4 flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                EduShare
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <nav className="px-4 grid gap-6 py-6">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="w-full pl-8"
                />
              </div>
            </form>
            <RouterLink
              to="/"
              className="text-lg font-medium text-primary hover:underline"
            >
              Home
            </RouterLink>
            <RouterLink
              to="/courses"
              className="text-lg font-medium text-muted-foreground hover:underline"
            >
              Courses
            </RouterLink>
            <RouterLink
              to="/paths"
              className="text-lg font-medium text-muted-foreground hover:underline"
            >
              Paths
            </RouterLink>
            <RouterLink
              to="/community"
              className="text-lg font-medium text-muted-foreground hover:underline"
            >
              Community
            </RouterLink>
            <RouterLink
              to="/about"
              className="text-lg font-medium text-muted-foreground hover:underline"
            >
              About
            </RouterLink>
            <div className="flex flex-col gap-4">
              <Button variant="outline" asChild className="w-full">
                <RouterLink to="/auth">Log in</RouterLink>
              </Button>
              <Button asChild className="w-full">
                <RouterLink to="/auth">Sign up</RouterLink>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
