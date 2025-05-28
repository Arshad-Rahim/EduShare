"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Bell, BookOpen, ChevronDown, Menu, Search } from "lucide-react";
import { useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { logoutAdmin } from "@/redux/slice/adminSlice";
import { adminService } from "@/services/adminService/authService";
import { RootState } from "@/redux/store";
import { AxiosError } from "axios";

// Define types for type safety
interface User {
  id: string; // From adminService AdminLoginResponse
  name: string;
  email: string;
}

interface HeaderProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarOpen: boolean;
}

// Constants for maintainability
const ADMIN_LOGIN_PATH = "/admin/login";
const DEFAULT_USER_NAME = "Admin User";
const DEFAULT_USER_ROLE = "Administrator";
const LOCAL_STORAGE_KEY = "adminDatas";



/**
 * Renders the admin dashboard header with sidebar toggle, branding, search, notifications, and user dropdown.
 * @param setSidebarOpen - Function to toggle the sidebar state.
 * @param sidebarOpen - Current sidebar state.
 * @returns The header component.
 */
const Header: React.FC<HeaderProps> = ({ setSidebarOpen, sidebarOpen }) => {
  // Use adminData from Redux instead of hardcoded null
  const adminData = useSelector(
    (state: RootState) => state.admin?.adminDatas as User | null
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Memoize logout handler
  const handleLogout = useCallback(async () => {
    try {
      const response = await adminService.logoutAdmin();
      toast.success(response.data.message);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      dispatch(logoutAdmin());
      navigate(ADMIN_LOGIN_PATH);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Admin logout failed:", {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      toast.error("Failed to sign out");
    }
  }, [dispatch, navigate]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between space-x-4 sm:space-x-0">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">
              TechLearn{" "}
              <span className="text-sm font-normal text-muted-foreground">
                Admin
              </span>
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] pl-8 md:w-[300px]"
            />
          </div>
          <Button variant="outline" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32&text=A"
                    alt={adminData?.name || DEFAULT_USER_NAME}
                  />
                  <AvatarFallback>
                    {adminData?.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start text-sm md:flex">
                  <span>{adminData?.name || DEFAULT_USER_NAME}</span>
                  <span className="text-xs text-muted-foreground">
                    {adminData?.email || DEFAULT_USER_ROLE}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-md border bg-background p-1 shadow-lg"
            >
              <DropdownMenuLabel className="px-2 py-1.5">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {adminData?.name || DEFAULT_USER_NAME}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {adminData?.email || DEFAULT_USER_ROLE}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 h-px bg-muted" />
              {/* TODO: Uncomment when profile/settings routes are implemented */}
              {/* <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="px-2 py-1.5 text-sm hover:bg-muted cursor-pointer rounded-sm"
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/settings")}
                className="px-2 py-1.5 text-sm hover:bg-muted cursor-pointer rounded-sm"
              >
                Settings
              </DropdownMenuItem> */}
              <DropdownMenuSeparator className="my-1 h-px bg-muted" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="px-2 py-1.5 text-sm hover:bg-muted cursor-pointer rounded-sm"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);
