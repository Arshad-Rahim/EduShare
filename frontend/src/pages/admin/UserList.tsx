import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search } from "lucide-react";
import Header from "./components/admin/Header";
import SideBar from "./components/admin/SideBar";
import Table from "@/components/tableStructure/TableReusableStructure";
import { Switch } from "@/components/ui/switch";
import { userService } from "@/services/adminService/userService";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  lastActive: string;
  enrolledCourses: number;
}

const UserListing: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const rowsPerPage = 3;
  const [debouncedValue] = useDebounce(searchQuery, 500);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userService.userList(
          currentPage,
          rowsPerPage,
          debouncedValue
        );
        setUsers(response.data.users);
        setTotalPages(Math.ceil(response.data.total / rowsPerPage));
        // toast.success("Users loaded successfully");
      } catch (error) {
        toast.error("Failed to load users");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, debouncedValue]);

  const handleToggleStatus = useCallback(
    async (userId: string, currentBlocked: boolean) => {
      const newBlocked = !currentBlocked;
      try {
        await userService.blockUser(userId, newBlocked);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isBlocked: newBlocked } : user
          )
        );
        toast.success(
          `User ${newBlocked ? "blocked" : "unblocked"} successfully`
        );
      } catch (error) {
        console.error("Toggle status error:", error);
        toast.error("Failed to update user status");
      }
    },
    []
  );

  const headers = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      {
        key: "isBlocked",
        label: "Status",
        render: (user: User) => (user.isBlocked ? "Blocked" : "Active"),
      },
      { key: "lastActive", label: "Last Active" },
      { key: "enrolledCourses", label: "Enrolled Courses" },
      {
        key: "actions",
        label: "Actions",
        render: (user: User) => (
          <div className="flex gap-2 items-center">
            {/* <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
              <Edit className="h-4 w-4" />
            </Button> */}
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenDeleteModal(user._id)}
            >
              <Trash className="h-4 w-4" />
            </Button> */}
            <Switch
              checked={!user.isBlocked}
              onCheckedChange={() =>
                handleToggleStatus(user._id, user.isBlocked)
              }
              className="ml-2"
            />
          </div>
        ),
      },
    ],
    [handleToggleStatus]
  );

  const paginationItems = useMemo(
    () =>
      Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <PaginationItem key={page}>
          <PaginationLink
            href="#"
            isActive={page === currentPage}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      )),
    [totalPages, currentPage]
  );

  return (
    <>
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex min-h-screen w-full pt-16">
        <aside
          className={cn(
            "inset-y-0 left-0 top-16 w-64 border-r bg-background",
            sidebarOpen ? "block" : "hidden",
            "md:block"
          )}
        >
          <SideBar />
        </aside>
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">User Listing</h2>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <Table
                headers={headers}
                data={users}
                rowKey="_id"
                className="shadow-md rounded-lg"
              />
              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                    {paginationItems}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
          {/* <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
            title="Delete User"
            description="Are you sure you want to delete this user? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
          /> */}
        </main>
      </div>
    </>
  );
};

export default React.memo(UserListing);
