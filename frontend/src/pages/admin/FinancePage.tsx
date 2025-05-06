import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "./components/admin/Header";
import { SideBar } from "./components/admin/SideBar";
import Table from "@/components/tableStructure/TableReusableStructure";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { walletService } from "@/services/walletService";
import { transactionService } from "@/services/transactionService";
import { useDebounce } from "use-debounce";

interface Transaction {
  transactionId: string;
  amount: number;
  transaction_type: string;
  description: string;
  createdAt: string;
  purchase_id: {
    userId: { name: string };
    purchase: Array<{
      courseId: { title: string };
      orderId: string;
      amount: number;
      status: string;
      createdAt: string;
    }>;
  };
}

interface WalletResponse {
  _id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export function FinancePage() {
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(true); // For initial wallet data fetch
  const [tableLoading, setTableLoading] = useState(false); // For transactions table fetch
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const rowsPerPage = 6; // Match WalletPage

  // State for filters
  const [courseNameFilter, setCourseNameFilter] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [debouncedValue] = useDebounce(courseNameFilter, 500);

  const navigate = useNavigate();

  // Fetch wallet data only on component mount
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const walletResponse = await walletService.getWalletData();
        console.log("ADMIN WALLET DATA", walletResponse.data.wallet);
        setWalletData(walletResponse.data.wallet);
      } catch (error: any) {
        console.error("Failed to fetch finance data:", error);
        setError(
          error.response?.data?.message || "Failed to load finance data"
        );
        toast.error(
          error.response?.data?.message || "Failed to load finance data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []); // Empty dependency array to run only on mount

  // Fetch transactions when filters or page changes
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!walletData?._id) return; // Skip if wallet data isn't loaded

      try {
        setTableLoading(true);
        const transactionsResponse = await transactionService.getTransactions(
          { data: { wallet: walletData } },
          currentPage,
          rowsPerPage,
          {
            courseName: courseNameFilter,
            startDate: startDateFilter,
            endDate: endDateFilter,
          }
        );

        console.log(
          "ADMIN TRANSACTIONS DATA",
          transactionsResponse.data.transactions
        );
        setTransactions(transactionsResponse.data.transactions || []);
        setTotalPages(
          Math.ceil(transactionsResponse.data.totalTransaction / rowsPerPage)
        );
      } catch (error: any) {
        console.error("Failed to fetch transactions:", error);
        toast.error(
          error.response?.data?.message || "Failed to load transactions"
        );
      } finally {
        setTableLoading(false);
      }
    };

    fetchTransactions();
  }, [walletData, currentPage, debouncedValue, startDateFilter, endDateFilter]); // Run when walletData or filters change

  // Add a separate useEffect to log walletData and transactions after they update
  useEffect(() => {
    if (walletData) {
      console.log("ADMIN WALLET DATA (AFTER STATE UPDATE)", walletData);
    }
    if (transactions) {
      console.log("ADMIN TRANSACTIONS (AFTER STATE UPDATE)", transactions);
    }
  }, [walletData, transactions]);

  // Reset filters
  const handleClearFilters = () => {
    setCourseNameFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setCurrentPage(1); // Reset to first page
  };

  // Define headers for the reusable Table component in a standard order (matching WalletPage)
  const headers = [
    {
      key: "createdAt",
      label: "Date",
      render: (transaction: Transaction) =>
        new Date(transaction.createdAt).toLocaleDateString(),
    },
    {
      key: "userName",
      label: "User Name",
      render: (transaction: Transaction) =>
        transaction.purchase_id?.userId?.name || "N/A",
    },
    {
      key: "courseName",
      label: "Course Name",
      render: (transaction: Transaction) =>
        transaction.purchase_id?.purchase?.[0]?.courseId?.title || "N/A",
    },
    { key: "transaction_type", label: "Type" },
    {
      key: "amount",
      label: "Amount",
      render: (transaction: Transaction) =>
        transaction.transaction_type === "credit"
          ? `+₹${transaction.amount.toFixed(2)}`
          : `-₹${transaction.amount.toFixed(2)}`,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading finance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => navigate(0)}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No finance data available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header setSidebarOpen={() => {}} sidebarOpen={true} />
      <div className="flex">
        <aside className="fixed inset-y-0 left-0 top-16 z-30 w-64 shrink-0 border-r bg-background pt-4 md:block">
          <SideBar />
        </aside>
        <main className="flex-1 md:ml-64 p-6">
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Finances</CardTitle>
              <CardDescription>
                Overview of your wallet balance and transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-xl font-semibold">Balance</h3>
                <p className="text-2xl font-bold">
                  ₹{walletData.balance.toFixed(2)}
                </p>
              </div>

              {/* Filter Section with Improved UI */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
                <h4 className="text-lg font-medium text-gray-800 mb-4">
                  Filter Transactions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Name
                    </label>
                    <input
                      type="text"
                      value={courseNameFilter}
                      onChange={(e) => {
                        setCourseNameFilter(e.target.value);
                        setCurrentPage(1); // Reset to first page on filter change
                      }}
                      placeholder="Enter course name..."
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDateFilter}
                      onChange={(e) => {
                        const newStartDate = e.target.value;
                        const today = new Date();
                        today.setHours(0, 0, 0, 0); // Normalize to start of day
                        if (newStartDate && new Date(newStartDate) > today) {
                          toast.error("Start date cannot be a future date");
                          return;
                        }
                        setStartDateFilter(newStartDate);
                        setCurrentPage(1); // Reset to first page on filter change
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDateFilter}
                      onChange={(e) => {
                        const newEndDate = e.target.value;
                        if (
                          startDateFilter &&
                          newEndDate &&
                          new Date(newEndDate) < new Date(startDateFilter)
                        ) {
                          toast.error(
                            "End date cannot be earlier than start date"
                          );
                          return;
                        }
                        setEndDateFilter(newEndDate);
                        setCurrentPage(1); // Reset to first page on filter change
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="bg-white text-gray-700 border-gray-300 hover:bg-gray-100 transition"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                {tableLoading ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Loading transactions...
                    </p>
                  </div>
                ) : (
                  <>
                    <Table
                      headers={headers}
                      data={transactions || []}
                      rowKey="transactionId"
                      className="shadow-md rounded-lg"
                      noDataMessage="No transactions available."
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
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                isActive={page === currentPage}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
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
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
