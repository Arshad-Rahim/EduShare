import { Button } from "@/components/ui/button";
import {
  FileText,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { toast } from "sonner";
import { tutorService } from "@/services/tutorService/tutorService";

interface SideBarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

function SideBar({ sidebarOpen, setSidebarOpen }: SideBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch tutor profile
  const fetchTutorProfile = useCallback(async () => {
    try {
      const response = await tutorService.tutorDetails();
      setIsAccepted(response.data.tutor.isAccepted);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch tutor profile:", error);
      toast.error("Failed to load profile data");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTutorProfile();
  }, [fetchTutorProfile]);

  // Handle navigation
  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path);
      setSidebarOpen(false);
    },
    [navigate, setSidebarOpen]
  );

  // Memoized nav items
  const navItems = useMemo(
    () => [
      {
        icon: <LayoutDashboard className="h-4 w-4" />,
        name: "Dashboard",
        path: "/tutor/home",
        disabled: isAccepted === false,
      },
      {
        icon: <FileText className="h-4 w-4" />,
        name: "My Courses",
        path: "/tutor/courses",
        disabled: isAccepted === false,
      },
      {
        icon: <Users className="h-4 w-4" />,
        name: "Students",
        path: "/tutor/students",
        disabled: isAccepted === false,
      },
      {
        icon: <MessageSquare className="h-4 w-4" />,
        name: "Messages",
        path: "/tutor/messages",
        disabled: isAccepted === false,
      },
    ],
    [isAccepted]
  );

  // Memoized bottom items
  const bottomItems = useMemo(
    () => [
      {
        icon: <Settings className="h-4 w-4" />,
        name: "Settings",
        path: "/tutor/settings",
        disabled: isAccepted === false,
      },
      {
        icon: <HelpCircle className="h-4 w-4" />,
        name: "Help & Support",
        path: "/tutor/help",
        disabled: isAccepted === false,
      },
    ],
    [isAccepted]
  );

  // Memoized loading UI
  const loadingUI = useMemo(
    () => (
      <aside
        className={`${
          sidebarOpen ? "block" : "hidden"
        } fixed inset-y-0 left-0 top-16 z-30 w-64 shrink-0 border-r bg-background pt-4 md:block`}
      >
        <div className="flex h-full flex-col justify-center items-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </aside>
    ),
    [sidebarOpen]
  );

  // Memoized navigation items UI
  const navItemsUI = useMemo(
    () =>
      navItems.map((item) => (
        <Button
          key={item.name}
          variant={location.pathname === item.path ? "secondary" : "ghost"}
          className="justify-start"
          onClick={() => !item.disabled && handleNavigation(item.path)}
          disabled={item.disabled}
          title={
            item.disabled
              ? "This feature is available only after acceptance"
              : undefined
          }
        >
          {item.icon}
          <span className="ml-2">{item.name}</span>
        </Button>
      )),
    [navItems, location.pathname, handleNavigation]
  );

  // Memoized bottom items UI
  const bottomItemsUI = useMemo(
    () =>
      bottomItems.map((item) => (
        <Button
          key={item.name}
          variant={location.pathname === item.path ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => handleNavigation(item.path)}
          disabled={item.disabled}
        >
          {item.icon}
          <span className="ml-2">{item.name}</span>
        </Button>
      )),
    [bottomItems, location.pathname, handleNavigation]
  );

  if (loading) {
    return loadingUI;
  }

  return (
    <aside
      className={`${
        sidebarOpen ? "block" : "hidden"
      } fixed inset-y-0 left-0 top-16 z-30 w-64 shrink-0 border-r bg-background pt-4 md:block`}
    >
      <div className="flex h-full flex-col">
        {/* Close button for mobile view */}
        <div className="flex justify-between items-center px-4 py-2 md:hidden">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            EduShare
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <nav className="mt-6 grid gap-1 px-2">{navItemsUI}</nav>
        <div className="mt-auto border-t px-4 py-4">{bottomItemsUI}</div>
      </div>
    </aside>
  );
}

export default memo(SideBar);
