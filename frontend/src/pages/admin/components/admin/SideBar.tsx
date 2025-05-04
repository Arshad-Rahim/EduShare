import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  BarChart3,
  Building,
  Database,
  DollarSign,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom"; // Added useLocation

export function SideBar() {
  const location = useLocation(); // Added to get current pathname

  return (
    <div className="flex h-full flex-col">
      <nav className="grid gap-1 px-2">
        {[
          {
            icon: <LayoutDashboard className="h-4 w-4" />,
            name: "Dashboard",
            path: "/admin/home",
          },
          {
            icon: <Users className="h-4 w-4" />,
            name: "Students",
            path: "/admin/userList",
          },
          {
            icon: <Layers className="h-4 w-4" />,
            name: "Courses",
            path: "/admin/courses",
          },
          {
            icon: <Building className="h-4 w-4" />,
            name: "Tutors",
            path: "/admin/tutorList",
          },
          {
            icon: <DollarSign className="h-4 w-4" />,
            name: "Finances",
            path: "/admin/finances",
          },
          // {
          //   icon: <BarChart3 className="h-4 w-4" />,
          //   name: "Analytics",
          //   path: "/admin/analytics",
          // },
          // {
          //   icon: <MessageSquare className="h-4 w-4" />,
          //   name: "Support Tickets",
          //   path: "/admin/support",
          // },
          // {
          //   icon: <Database className="h-4 w-4" />,
          //   name: "Content Management",
          //   path: "/admin/content",
          // },
          // {
          //   icon: <AlertCircle className="h-4 w-4" />,
          //   name: "Reports & Issues",
          //   path: "/admin/reports",
          // },
        ].map((item) => (
          <Button
            key={item.name}
            variant={location.pathname === item.path ? "secondary" : "ghost"} // Dynamic variant based on current path
            className="justify-start"
            asChild
          >
            <Link to={item.path}>
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </Link>
          </Button>
        ))}
      </nav>
      <div className="mt-auto border-t px-4 py-4">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Platform Settings
        </Button>
      </div>
    </div>
  );
}
