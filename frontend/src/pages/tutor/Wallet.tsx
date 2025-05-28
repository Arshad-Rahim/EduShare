import { useState, useEffect, useCallback, useMemo, memo } from "react";
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
import Header from "./components/Header";
import SideBar from "./components/SideBar";
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
  createdAt: string;
}

interface WalletResponse {
  _id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

function WalletPage() {
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courseNameFilter, setCourseNameFilter] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [debouncedValue] = useDebounce(courseNameFilter, 500);
  const rowsPerPage = 6;

  const navigate = useNavigate();

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      const walletResponse = await walletService.getWalletData();
      console.log("WALLET DATA ABOVE AREA", walletResponse.data.wallet);
      setWalletData(walletResponse.data.wallet);
    } catch (error: any) {
      console.error("Failed to fetch wallet data:", error);
      setError(error.response?.data?.message || "Failed to load wallet data");
      toast.error(
        error.response?.data?.message || "Failed to load wallet data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!walletData?._id) return;

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

      console.log("TRANSACTIONS DATA", transactionsResponse.data.transactions);
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
  }, [
    walletData?._id,
    currentPage,
    debouncedValue,
    startDateFilter,
    endDateFilter,
    courseNameFilter,
    rowsPerPage,
  ]);

  const handleClearFilters = useCallback(() => {
    setCourseNameFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setCurrentPage(1);
  }, []);

  const headers = useMemo(
    () => [
      {
        key: "createdAt",
        label: "Date",
        render: useCallback(
          (transaction: Transaction) =>
            new Date(transaction.createdAt).toLocaleDateString(),
          []
        ),
      },
      {
        key: "userName",
        label: "User Name",
        render: useCallback(
          (transaction: Transaction) =>
            transaction.purchase_id?.userId?.name || "N/A",
          []
        ),
      },
      {
        key: "courseName",
        label: "Course Name",
        render: useCallback(
          (transaction: Transaction) =>
            transaction.purchase_id?.purchase?.[0]?.courseId?.title || "N/A",
          []
        ),
      },
      { key: "transaction_type", label: "Type" },
      {
        key: "amount",
        label: "Amount",
        render: useCallback(
          (transaction: Transaction) =>
            transaction.transaction_type === "credit"
              ? `+₹${transaction.amount.toFixed(2)}`
              : `-₹${transaction.amount.toFixed(2)}`,
          []
        ),
      },
    ],
    []
  );

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (walletData) {
      console.log("WALLET DATA (AFTER STATE UPDATE)", walletData);
    }
    if (transactions) {
      console.log("TRANSACTIONS (AFTER STATE UPDATE)", transactions);
    }
  }, [walletData, transactions]);

  const loadingUI = useMemo(
    () => (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading wallet data...</p>
      </div>
    ),
    []
  );

  const errorUI = useMemo(
    () => (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            onClick={() => navigate(0)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    ),
    [error, navigate]
  );

  const noWalletDataUI = useMemo(
    () => (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No wallet data available.</p>
      </div>
    ),
    []
  );

  const transactionsTableUI = useMemo(
    () =>
      tableLoading ? (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Loading transactions...</p>
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
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
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
                        className={
                          page === currentPage
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "hover:bg-gray-100"
                        }
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
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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
      ),
    [tableLoading, transactions, headers, currentPage, totalPages]
  );

  if (loading) return loadingUI;
  if (error) return errorUI;
  if (!walletData) return noWalletDataUI;

  return (
    <div className="min-h-screen bg-background">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-64 flex-shrink-0">
          <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
        <main className={`flex-1 p-6 ${sidebarOpen ? "md:ml-64" : ""}`}>
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Wallet Details</CardTitle>
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
                        setCurrentPage(1);
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
                        today.setHours(0, 0, 0, 0);
                        if (newStartDate && new Date(newStartDate) > today) {
                          toast.error("Start date cannot be a future date");
                          return;
                        }
                        setStartDateFilter(newStartDate);
                        setCurrentPage(1);
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
                        setCurrentPage(1);
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

              <div className="overflow-x-auto">{transactionsTableUI}</div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default memo(WalletPage);
