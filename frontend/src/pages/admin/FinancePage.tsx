import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authAxiosInstance } from "@/api/authAxiosInstance";
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

interface Transaction {
  transactionId: string;
  amount: number;
  transaction_type: string;
  description: string;
  createdAt: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const rowsPerPage = 1; // Match WalletPage
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setLoading(true);

        // Fetch admin's wallet data
        const walletResponse = await authAxiosInstance.get("/wallet/get-data");
        console.log("ADMIN WALLET DATA", walletResponse.data.wallet);
        setWalletData(walletResponse.data.wallet);

        // Fetch transactions using the admin's wallet ID with pagination
        if (walletResponse.data.wallet?._id) {
          const transactionsResponse = await authAxiosInstance.get(
            `/transaction/transaction-details?walletId=${walletResponse.data.wallet._id}&page=${currentPage}&limit=${rowsPerPage}`
          );
          console.log(
            "ADMIN TRANSACTIONS DATA",
            transactionsResponse.data.transactions
          );
          setTransactions(transactionsResponse.data.transactions || []);
          setTotalPages(
            Math.ceil(transactionsResponse.data.totalTransaction / rowsPerPage)
          );
        } else {
          setTransactions([]);
          setTotalPages(0);
        }
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

    fetchFinanceData();
  }, [currentPage]); // Re-fetch when currentPage changes

  // Add a separate useEffect to log walletData and transactions after they update
  useEffect(() => {
    if (walletData) {
      console.log("ADMIN WALLET DATA (AFTER STATE UPDATE)", walletData);
    }
    if (transactions) {
      console.log("ADMIN TRANSACTIONS (AFTER STATE UPDATE)", transactions);
    }
  }, [walletData, transactions]);

  // Define headers for the reusable Table component
  const headers = [
    {
      key: "amount",
      label: "Amount",
      render: (transaction: Transaction) =>
        transaction.transaction_type === "credit"
          ? `+₹${transaction.amount.toFixed(2)}`
          : `-₹${transaction.amount.toFixed(2)}`,
    },
    { key: "transaction_type", label: "Type" },
    { key: "description", label: "Description" },
    {
      key: "createdAt",
      label: "Date",
      render: (transaction: Transaction) =>
        new Date(transaction.createdAt).toLocaleDateString(),
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
              <div className="overflow-x-auto">
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
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
