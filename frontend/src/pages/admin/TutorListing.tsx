import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "use-debounce";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Check, X } from "lucide-react";
import  Header  from "./components/admin/Header";
import  SideBar  from "./components/admin/SideBar";
import Table from "@/components/tableStructure/TableReusableStructure";
import { Switch } from "@/components/ui/switch";
import { DocumentViewModal } from "@/components/modal-components/DocumentViewModal";
import { ApprovalConfirmationModal } from "@/components/modal-components/ApprovalConfirmationModal";
import { RejectionReasonModal } from "@/components/modal-components/RejectionReasonModal";
import { tutorService } from "@/services/adminService/tutorService";

interface Tutor {
  _id: string;
  name: string;
  email: string;
  role: string;
  specialization: string;
  isBlocked: boolean;
  verificationDocUrl?: string;
  approvalStatus: "pending" | "approved" | "rejected";
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

  // Modal states
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState("");
  const [selectedTutorName, setSelectedTutorName] = useState("");

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [tutorToApprove, setTutorToApprove] = useState<string | null>(null);

  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [tutorToReject, setTutorToReject] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [debouncedValue] = useDebounce(searchQuery, 500);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const response = await tutorService.userList(
          currentPage,
          rowsPerPage,
          debouncedValue
        );
        console.log("Fetched tutors:", response.data.users);
        setTutors(response.data.users);
        setTotalPages(Math.ceil(response.data.total / rowsPerPage));
        // toast.success("Tutors loaded successfully");
      } catch (error) {
        toast.error("Failed to load tutors");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, [currentPage, debouncedValue]);

  const handleToggleStatus = useCallback(
    async (tutorId: string, currentBlocked: boolean) => {
      const newBlocked = !currentBlocked;
      try {
        await tutorService.blockTutor(tutorId, newBlocked);
        setTutors((prevTutors) =>
          prevTutors.map((tutor) =>
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
    },
    []
  );

  const handleOpenApprovalModal = useCallback((tutorId: string) => {
    setTutorToApprove(tutorId);
    setIsApprovalModalOpen(true);
  }, []);

  const handleApprove = useCallback(async () => {
    if (!tutorToApprove) return;

    try {
      await tutorService.tutorApproval(tutorToApprove);
      setTutors((prevTutors) =>
        prevTutors.map((tutor) =>
          tutor._id === tutorToApprove
            ? { ...tutor, approvalStatus: "approved" }
            : tutor
        )
      );
      toast.success("Tutor approved successfully");
      setIsApprovalModalOpen(false);
      setTutorToApprove(null);
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Failed to approve tutor");
    }
  }, [tutorToApprove]);

  const handleOpenRejectionModal = useCallback((tutorId: string) => {
    setTutorToReject(tutorId);
    setRejectionReason("");
    setIsRejectionModalOpen(true);
  }, []);

  const handleReject = useCallback(async () => {
    if (!tutorToReject || !rejectionReason.trim()) return;

    try {
      await tutorService.tutorReject(tutorToReject, rejectionReason);
      setTutors((prevTutors) =>
        prevTutors.map((tutor) =>
          tutor._id === tutorToReject
            ? { ...tutor, approvalStatus: "rejected" }
            : tutor
        )
      );
      toast.success("Tutor rejected successfully");
      setIsRejectionModalOpen(false);
      setTutorToReject(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error("Failed to reject tutor");
    }
  }, [tutorToReject, rejectionReason]);

  const handleViewDocument = useCallback(
    (documentUrl: string, tutorName: string) => {
      setSelectedDocumentUrl(documentUrl);
      setSelectedTutorName(tutorName);
      setIsDocumentModalOpen(true);
    },
    []
  );

  const headers = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "specialization", label: "Specialization" },
      {
        key: "isBlocked",
        label: "Status",
        render: (tutor: Tutor) => (tutor.isBlocked ? "Blocked" : "Active"),
      },
      {
        key: "verificationDocUrl",
        label: "Verification Document",
        render: (tutor: Tutor) =>
          tutor.verificationDocUrl ? (
            <Button
              variant="link"
              className="text-blue-500 p-0 h-auto font-normal hover:underline"
              onClick={() =>
                handleViewDocument(tutor.verificationDocUrl!, tutor.name)
              }
            >
              View Document
            </Button>
          ) : (
            "No Document"
          ),
      },
      { key: "lastActive", label: "Last Active" },
      {
        key: "actions",
        label: "Actions",
        render: (tutor: Tutor) => (
          <div className="flex gap-2 items-center">
            {tutor.approvalStatus === "pending" ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenApprovalModal(tutor._id)}
                  className="hover:bg-green-50"
                  disabled={!tutor.verificationDocUrl}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenRejectionModal(tutor._id)}
                  className="hover:bg-red-50"
                  disabled={!tutor.verificationDocUrl}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </>
            ) : (
              <Switch
                checked={!tutor.isBlocked}
                onCheckedChange={() =>
                  handleToggleStatus(tutor._id, tutor.isBlocked)
                }
                className="ml-2"
                disabled={tutor.approvalStatus === "rejected"}
              />
            )}
          </div>
        ),
      },
    ],
    [
      handleViewDocument,
      handleOpenApprovalModal,
      handleOpenRejectionModal,
      handleToggleStatus,
    ]
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
        </main>
      </div>

      <DocumentViewModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        documentUrl={selectedDocumentUrl}
        tutorName={selectedTutorName}
      />

      <ApprovalConfirmationModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onConfirm={handleApprove}
      />

      <RejectionReasonModal
        isOpen={isRejectionModalOpen}
        onClose={() => setIsRejectionModalOpen(false)}
        reason={rejectionReason}
        onReasonChange={setRejectionReason}
        onConfirm={handleReject}
      />
    </>
  );
};

export default React.memo(TutorListing);
