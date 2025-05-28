import { Button } from "@/components/ui/button";
import {
  Building,
  DollarSign,
  Layers,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import React, { memo, useMemo } from "react";

// Define nav item interface for type safety
interface NavItem {
  id: string; // Unique identifier
  icon: JSX.Element;
  name: string;
  route: string; // Renamed 'path' to 'route' for clarity
}

// Constants for maintainability
const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    name: "Dashboard",
    route: "/admin/home",
  },
  {
    id: "students",
    icon: <Users className="h-4 w-4" />,
    name: "Students",
    route: "/admin/userList",
  },
  {
    id: "courses",
    icon: <Layers className="h-4 w-4" />,
    name: "Courses",
    route: "/admin/courses",
  },
  {
    id: "tutors",
    icon: <Building className="h-4 w-4" />,
    name: "Tutors",
    route: "/admin/tutorList",
  },
  {
    id: "finances",
    icon: <DollarSign className="h-4 w-4" />,
    name: "Finances",
    route: "/admin/finances",
  },
  // TODO: Uncomment when routes are implemented
  // {
  //   id: "analytics",
  //   icon: <BarChartSvg className="h-4 w-4" />,
  //   name: "Analytics",
  //   route: "/admin/analytics",
  // },
  // {
  //   id: "support",
  //   icon: <MessageSquareSvg className="h-4 w-4" />,
  //   name: "Support Tickets",
  //   route: "/admin/support",
  // },
  // {
  //   id: "content",
  //   icon: <DatabaseSvg className="h-4 w-4" />,
  //   name: "Content Management",
  //   route: "/admin/content",
  // },
  // {
  //   id: "reports",
  //   icon: <AlertSvg className="h-4 w-4" />,
  //   name: "Reports & Issues",
  //   route: "/admin/reports",
  // },
];

const SETTINGS_CONTENT = {
  routeLabel: "Platform Settings",
  routePath: "/settings",
};

/**
 * Renders the sidebar for the admin dashboard with navigation links and settings.
 * @returns The sidebar component with navigation and settings button.
 */
const Sidebar: React.FC = () => {
  const { pathname } = useLocation();

  // Memoize navigation items to prevent re-creation
  const navItems = useMemo(() => NAV_ITEMS, []);

  return (
    <div className="flex h-full flex-col">
      <nav className="grid gap-1 px-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={pathname.startsWith(item.route) ? "secondary" : "ghost"}
            className="justify-start px-2 py-1.5 rounded-sm"
            asChild
            aria-current={pathname.startsWith(item.route) ? "page" : undefined}
            aria-label={`Navigate to ${item.name}`}
          >
            <Link to={item.route}>
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </Link>
          </Button>
        ))}
      </nav>
      <div className="mt-auto border-t px-4 py-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 px-2 py-1.5 rounded-sm"
          asChild
          aria-label="Navigate to Platform Settings"
          // TODO: Implement settings functionality or navigation
          // onClick={() => console.log("Settings clicked")}
        >
          <Link to={SETTINGS_CONTENT.routePath}>
            <Settings className="h-4 w-4" />
            {SETTINGS_CONTENT.routeLabel}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default memo(Sidebar);
