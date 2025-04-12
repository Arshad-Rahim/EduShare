import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Calendar,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  Video,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { authAxiosInstance } from "@/api/authAxiosInstance"; // Import the axios instance
import { toast } from "sonner"; // Import toast for error handling

export function SideBar({ sidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation(); // Get current route
  const [isAccepted, setIsAccepted] = useState(null); // State to store isAccepted status
  const [loading, setLoading] = useState(true); // State to handle loading

  // Fetch tutor profile data
  const fetchTutorProfile = async () => {
    try {
      const response = await authAxiosInstance.get("/tutors/me");
      setIsAccepted(response.data.tutor.isAccepted); // Assuming isAccepted is in the tutor object
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch tutor profile:", error);
      toast.error("Failed to load profile data");
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchTutorProfile();
  }, []);

  // Define sidebar items with their routes
  const navItems = [
    {
      icon: <LayoutDashboard className="h-4 w-4" />,
      name: "Dashboard",
      path: "/tutor/home",
      disabled: isAccepted === false, // Always enabled
    },
    {
      icon: <FileText className="h-4 w-4" />,
      name: "My Courses",
      path: "/tutor/courses",
      disabled: isAccepted === false, // Always enabled
    },
    {
      icon: <Video className="h-4 w-4" />,
      name: "Content Creation",
      path: "/content-creation",
      disabled: isAccepted === false, // Disabled if isAccepted is false
    },
    {
      icon: <Users className="h-4 w-4" />,
      name: "Students",
      path: "/tutor/students",
      disabled: isAccepted === false, // Always enabled
    },
    {
      icon: <MessageSquare className="h-4 w-4" />,
      name: "Messages",
      path: "/messages",
      disabled: isAccepted === false, // Always enabled
    },
    {
      icon: <BarChart3 className="h-4 w-4" />,
      name: "Analytics",
      path: "/analytics",
      disabled: isAccepted === false, // Always enabled
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      name: "Schedule",
      path: "/schedule",
      disabled: isAccepted === false, // Always enabled
    },
  ];

  const bottomItems = [
    {
      icon: <Settings className="h-4 w-4" />,
      name: "Settings",
      path: "/settings",
      disabled: isAccepted === false, // Always enabled
    },
    {
      icon: <HelpCircle className="h-4 w-4" />,
      name: "Help & Support",
      path: "/help",
      disabled: isAccepted === false, // Always enabled
    },
  ];

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Render loading state if data is still being fetched
  if (loading) {
    return (
      <aside
        className={`${
          sidebarOpen ? "block" : "hidden"
        } fixed inset-y-0 left-0 top-16 z-30 w-64 shrink-0 border-r bg-background pt-4 md:block`}
      >
        <div className="flex h-full flex-col justify-center items-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`${
        sidebarOpen ? "block" : "hidden"
      } fixed inset-y-0 left-0 top-16 z-30 w-64 shrink-0 border-r bg-background pt-4 md:block`}
    >
      <div className="flex h-full flex-col">
        <nav className="mt-6 grid gap-1 px-2">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant={location.pathname === item.path ? "secondary" : "ghost"} // Highlight active route
              className="justify-start"
              onClick={() => !item.disabled && handleNavigation(item.path)} // Only navigate if not disabled
              disabled={item.disabled} // Disable button based on isAccepted
              title={
                item.disabled
                  ? "This feature is available only after acceptance"
                  : undefined
              } // Tooltip for disabled state
            >
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </Button>
          ))}
        </nav>
        <div className="mt-auto border-t px-4 py-4">
          {bottomItems.map((item) => (
            <Button
              key={item.name}
              variant={location.pathname === item.path ? "secondary" : "ghost"} // Highlight active route
              className="w-full justify-start"
              onClick={() => handleNavigation(item.path)} // Navigate on click
              disabled={item.disabled} // Apply disabled state
            >
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
}
