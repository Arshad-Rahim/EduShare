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
import { Search, Trash, Edit } from "lucide-react";
import { Header } from "./components/admin/Header";
import { SideBar } from "./components/admin/SideBar";
import Table from "@/components/modal-components/TableReusableStructure";

interface Tutor {
  id: string; // Changed to string to match Mongoose _id
  name: string;
  email: string;
  role: string;
  specialization: string;
  status: string;
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
        setTutors(response.data.users);
        setTotalPages(Math.ceil(response.data.total / rowsPerPage));
        // toast.success("Tutors loaded successfully");
      } catch (error) {
        toast.error("Failed to load tutors");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, [currentPage, searchQuery]);

  const headers = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "specialization", label: "Specialization" },
    { key: "status", label: "Status" },
    { key: "lastActive", label: "Last Active" },
    {
      key: "actions",
      label: "Actions",
      render: (tutor: Tutor) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(tutor)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(tutor.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleEdit = (tutor: Tutor) => {
    toast.info(`Editing tutor: ${tutor.name}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this tutor?")) {
      try {
        await authAxiosInstance.delete(`/api/users/${id}`);
        setTutors(tutors.filter((tutor) => tutor.id !== id));
        toast.success("Tutor deleted successfully");
        if (tutors.length === 1 && currentPage > 1)
          setCurrentPage(currentPage - 1);
        else {
          const response = await authAxiosInstance.get("/api/usersList", {
            params: {
              page: currentPage,
              limit: rowsPerPage,
              role: "Instructor",
            },
          });
          setTutors(response.data.users);
          setTotalPages(Math.ceil(response.data.total / rowsPerPage));
        }
      } catch (error) {
        toast.error("Failed to delete tutor");
      }
    }
  };

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
                rowKey="id"
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
        </main>
      </div>
    </>
  );
};

export default TutorListing;
