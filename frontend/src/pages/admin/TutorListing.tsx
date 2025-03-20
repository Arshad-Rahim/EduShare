import React, { useEffect, useState } from "react";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Trash, Edit, Check } from "lucide-react"; // Added Check icon
import { Header } from "./components/admin/Header";
import { SideBar } from "./components/admin/SideBar";
import Table from "@/components/modal-components/TableReusableStructure";
import { ConfirmationModal } from "@/components/modal-components/ConformationModal";
import { Switch } from "@/components/ui/switch";

interface Tutor {
  _id: string;
  name: string;
  email: string;
  role: string;
  specialization: string;
  isBlocked: boolean;
  isAccepted: boolean; // Added isAccepted field
  lastActive: string;
}

const TutorListing: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const rowsPerPage = 3;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tutorToDelete, setTutorToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const response = await authAxiosInstance.get("/usersList", {
          params: {
            page: currentPage,
            limit: rowsPerPage,
            search: searchQuery,
            role: "tutor",
          },
        });
        console.log("Fetched tutors:", response.data.users); // Debug
        setTutors(response.data.users);
        setTotalPages(Math.ceil(response.data.total / rowsPerPage));
        toast.success("Tutors loaded successfully");
      } catch (error) {
        toast.error("Failed to load tutors");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, [currentPage, searchQuery]);

  const handleEdit = (tutor: Tutor) => {
    toast.info(`Editing tutor: ${tutor.name}`);
  };

  const handleOpenDeleteModal = (id: string) => {
    console.log("Opening modal with ID:", id);
    setTutorToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!tutorToDelete) {
      console.log("No tutorToDelete set");
      return;
    }

    console.log("Starting delete for ID:", tutorToDelete);
    try {
      await authAxiosInstance.delete(`/users/${tutorToDelete}`);
      setTutors(tutors.filter((tutor) => tutor._id !== tutorToDelete));
      toast.success("Tutor deleted successfully");

      if (tutors.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        const response = await authAxiosInstance.get("/usersList", {
          params: { page: currentPage, limit: rowsPerPage, role: "tutor" },
        });
        setTutors(response.data.users);
        setTotalPages(Math.ceil(response.data.total / rowsPerPage));
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete tutor");
    } finally {
      console.log("Finally block: Closing modal");
      setIsDeleteModalOpen(false);
      setTutorToDelete(null);
    }
  };

  const handleToggleStatus = async (
    tutorId: string,
    currentBlocked: boolean
  ) => {
    const newBlocked = !currentBlocked;
    try {
      await authAxiosInstance.patch(`/users/${tutorId}/status`, {
        status: newBlocked,
      });
      setTutors(
        tutors.map((tutor) =>
          tutor._id === tutorId ? { ...tutor, isBlocked: newBlocked } : tutor
        )
      );
      toast.success(
        `Tutor ${newBlocked ? "blocked" : "unblocked"} successfully`
      );
    } catch (error) {
      console.error("Toggle status error:", error);
      toast.error("Failed to update tutor status");
    }
  };

  const handleApproval = async (tutorId: string) => {
    try {
      await authAxiosInstance.patch(`/tutors/${tutorId}/approval`, {
        isAccepted: true,
      });
      setTutors(
        tutors.map((tutor) =>
          tutor._id === tutorId ? { ...tutor, isAccepted: true } : tutor
        )
      );
      toast.success("Tutor approved successfully");
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Failed to approve tutor");
    }
  };

  const headers = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "specialization", label: "Specialization" },
    {
      key: "isBlocked",
      label: "Status",
      render: (tutor: Tutor) => (tutor.isBlocked ? "Blocked" : "Active"),
    },
    {
      key: "isAccepted",
      label: "Approval",
      render: (tutor: Tutor) => (tutor.isAccepted ? "Approved" : "Pending"),
    },
    { key: "lastActive", label: "Last Active" },
    {
      key: "actions",
      label: "Actions",
      render: (tutor: Tutor) => (
        <div className="flex gap-2 items-center">
          {/* Uncomment if you want Edit/Delete back */}
          {/* <Button variant="ghost" size="icon" onClick={() => handleEdit(tutor)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenDeleteModal(tutor._id)}
          >
            <Trash className="h-4 w-4" />
          </Button> */}
          {tutor.isAccepted ? (
            <Switch
              checked={!tutor.isBlocked}
              onCheckedChange={() =>
                handleToggleStatus(tutor._id, tutor.isBlocked)
              }
              className="ml-2"
            />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleApproval(tutor._id)}
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

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
            <h2 className="text-2xl font-bold">Tutor Listing</h2>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search tutors..."
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
                data={tutors}
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={page === currentPage}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
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
          <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
            title="Delete Tutor"
            description="Are you sure you want to delete this tutor? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
          />
        </main>
      </div>
    </>
  );
};

export default TutorListing;
