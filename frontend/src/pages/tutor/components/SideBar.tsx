import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Calendar,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Settings,
  Users,
  Video,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function SideBar({ sidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation(); // Get current route

  // Define sidebar items with their routes
  const navItems = [
    {
      icon: <LayoutDashboard className="h-4 w-4" />,
      name: "Dashboard",
      path: "/tutor/home",
    },
    {
      icon: <FileText className="h-4 w-4" />,
      name: "My Courses",
      path: "/tutor/courses",
    },
    {
      icon: <Video className="h-4 w-4" />,
      name: "Content Creation",
      path: "/content-creation",
    },
    {
      icon: <Users className="h-4 w-4" />,
      name: "Students",
      path: "/students",
    },
    {
      icon: <MessageSquare className="h-4 w-4" />,
      name: "Messages",
      path: "/messages",
    },
    {
      icon: <BarChart3 className="h-4 w-4" />,
      name: "Analytics",
      path: "/analytics",
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      name: "Schedule",
      path: "/schedule",
    },
  ];

  const bottomItems = [
    {
      icon: <Settings className="h-4 w-4" />,
      name: "Settings",
      path: "/settings",
    },
    {
      icon: <HelpCircle className="h-4 w-4" />,
      name: "Help & Support",
      path: "/help",
    },
  ];

  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
  };

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
              onClick={() => handleNavigation(item.path)} // Navigate on click
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
