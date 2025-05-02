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
import { Header } from "./components/Header";
import { SideBar } from "./components/SideBar";
import Table from "@/components/tableStructure/TableReusableStructure";

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

export function WalletPage() {
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);

        // Fetch wallet data
        const walletResponse = await authAxiosInstance.get("/wallet/get-data");
        console.log("WALLET DATA ABOVE AREA", walletResponse.data.wallet);
        setWalletData(walletResponse.data.wallet);

        // Fetch transactions using the wallet ID
        if (walletResponse.data.wallet?._id) {
          const transactionsResponse = await authAxiosInstance.get(
            `/transaction/transaction-details?walletId=${walletResponse.data.wallet._id}`
          );
          console.log(
            "TRANSACTIONS DATA",
            transactionsResponse.data.transactions
          );
          setTransactions(transactionsResponse.data.transactions || []);
        } else {
          setTransactions([]);
        }
      } catch (error: any) {
        console.error("Failed to fetch wallet data:", error);
        setError(error.response?.data?.message || "Failed to load wallet data");
        toast.error(
          error.response?.data?.message || "Failed to load wallet data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  // Add a separate useEffect to log walletData and transactions after they update
  useEffect(() => {
    if (walletData) {
      console.log("WALLET DATA (AFTER STATE UPDATE)", walletData);
    }
    if (transactions) {
      console.log("TRANSACTIONS (AFTER STATE UPDATE)", transactions);
    }
  }, [walletData, transactions]);

  // Define headers for the reusable Table component
  const headers = [
    { key: "transactionId", label: "Transaction ID" },
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
        <p className="text-muted-foreground">Loading wallet data...</p>
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
        <p className="text-muted-foreground">No wallet data available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <SideBar sidebarOpen={true} />
        <main className="flex-1 md:ml-64 p-6">
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
              <div className="overflow-x-auto">
                <Table
                  headers={headers}
                  data={transactions || []}
                  rowKey="transactionId"
                  className="shadow-md rounded-lg"
                  noDataMessage="No transactions available."
                />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
