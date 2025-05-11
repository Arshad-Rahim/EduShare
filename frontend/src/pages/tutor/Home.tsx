import { useState, useEffect } from "react";
import { Users, BarChart3, Wallet, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { useSelector } from "react-redux";
import { Header } from "./components/Header";
import { SideBar } from "./components/SideBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

// Reusable Table Component
type Column<T> = {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
};

type ReusableTableProps<T> = {
  columns: Column<T>[];
  data: T[];
};

function ReusableTable<T>({ columns, data }: ReusableTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead
              key={index}
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column, colIndex) => {
              const displayValue =
                typeof column.accessor === "function"
                  ? column.accessor(item)
                  : item[column.accessor as keyof T] instanceof Date
                  ? (
                      item[column.accessor as keyof T] as Date
                    ).toLocaleDateString()
                  : String(item[column.accessor as keyof T] ?? "-");
              return (
                <TableCell
                  key={colIndex}
                  className="text-xs sm:text-sm whitespace-nowrap"
                >
                  {displayValue}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface TStudent {
  _id: string;
  name: string;
  email: string;
  role: string;
  course: string;
  purchaseDate: string;
  amount: number;
}

interface Stat {
  title: string;
  value: string;
  icon: React.ReactNode;
}

interface CourseStat {
  course: string;
  students: number;
  revenue: string;
}

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

export function TutorHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Changed to toggleable, default to false for mobile
  const [students, setStudents] = useState<TStudent[] | null>(null);
  const [stats, setStats] = useState<Stat[] | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStat[] | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: any) => state.user.userDatas);
  const userId = user?.id ? user?.id : user?._id;
  const navigate = useNavigate();

  // Fetch dashboard data (students, revenue, wallet balance, and transactions)
  const fetchDashboardData = async () => {
    console.log("fetchDashboardData called");
    console.log("User:", user);

    if (!userId) {
      console.warn("No user.id, cannot fetch data");
      setError("User not authenticated. Please log in.");
      setLoading(false);
      toast.error("Please log in to view dashboard");
      return;
    }

    try {
      console.log("Fetching /tutors/students");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      // Fetch students and revenue
      const studentsResponse = await authAxiosInstance.get("/tutors/students", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      console.log("Students Response:", studentsResponse.data);

      const studentsData = studentsResponse.data?.students || [];
      const totalRevenue = studentsResponse.data?.totalRevenue || 0;

      setStudents(studentsData);

      // Fetch wallet balance and walletId
      console.log("Fetching /wallet/get-data");
      const walletResponse = await authAxiosInstance.get("/wallet/get-data", {
        signal: controller.signal,
      });
      console.log("WALLET RESPONSE THAT GET", walletResponse);

      // Check if wallet exists, otherwise set defaults
      let balance = 0;
      let fetchedWalletId = null;
      if (walletResponse.data?.wallet) {
        balance = walletResponse.data.wallet.balance || 0;
        fetchedWalletId = walletResponse.data.wallet._id || null;
      }

      setWalletBalance(balance);

      // Fetch wallet transactions only if walletId exists
      let transactionsData: Transaction[] = [];
      if (fetchedWalletId) {
        console.log(
          "Fetching /transaction/transaction-details with walletId:",
          fetchedWalletId
        );
        const transactionsResponse = await authAxiosInstance.get(
          `/transaction/transaction-details?walletId=${fetchedWalletId}`,
          {
            signal: controller.signal,
          }
        );
        transactionsData = transactionsResponse.data?.transactions || [];
      } else {
        console.log(
          "No wallet exists for this tutor, skipping transactions fetch"
        );
      }
      setTransactions(transactionsData);

      // Calculate tutor's share (90% of total revenue)
      const tutorShare = totalRevenue * 0.9;

      // Calculate stats
      setStats([
        {
          title: "Active Students",
          value: studentsData.length.toString(),
          icon: <Users className="h-4 sm:h-5 w-4 sm:w-5" />,
        },
        {
          title: "Your Earnings",
          value: `₹${tutorShare.toFixed(2)}`,
          icon: <BarChart3 className="h-4 sm:h-5 w-4 sm:w-5" />,
        },
        {
          title: "Wallet Balance",
          value: `₹${balance.toFixed(2)}`,
          icon: <Wallet className="h-4 sm:h-5 w-4 sm:w-5" />,
        },
      ]);

      // Calculate course stats with tutor's share (90% of course revenue)
      const courseMap = studentsData.reduce((acc: any, student: TStudent) => {
        const course = student.course || "Unknown";
        if (!acc[course]) {
          acc[course] = { students: 0, amount: 0 };
        }
        acc[course].students += 1;
        acc[course].amount += student.amount || 0;
        return acc;
      }, {});

      const courseStatsData = Object.keys(courseMap).map((course) => ({
        course,
        students: courseMap[course].students,
        revenue: `₹${(courseMap[course].amount * 0.9).toFixed(2)}`,
      }));
      setCourseStats(courseStatsData);

      console.log("Stats:", stats);
      console.log("Course Stats:", courseStatsData);
      console.log("Students:", studentsData);
      console.log("Wallet Balance:", balance);
      console.log("Wallet ID:", fetchedWalletId);
      console.log("Transactions:", transactionsData);
    } catch (error: any) {
      console.error("Fetch error:", error);
      let errorMessage = "Failed to load dashboard data";
      if (error.name === "AbortError") {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.response) {
        errorMessage = `Server error: ${error.response.status} ${
          error.response.data?.message || ""
        }`;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect ran, user.id:", user?.id);
    if (userId) {
      fetchDashboardData();
    } else {
      console.warn("No user.id in useEffect, setting loading false");
      setError("User not authenticated. Please log in.");
      setLoading(false);
      toast.error("Please log in to view dashboard");
    }
  }, [user?.id]);

  // Student table columns
  const studentColumns: Column<TStudent>[] = [
    { header: "Student Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Course", accessor: "course" },
    {
      header: "Purchase Date",
      accessor: (student) =>
        new Date(student.purchaseDate).toLocaleDateString(),
    },
    {
      header: "Amount",
      accessor: (student) => `₹${student.amount.toFixed(2)}`,
    },
  ];

  // Course stats table columns
  const courseColumns: Column<CourseStat>[] = [
    { header: "Course", accessor: "course" },
    { header: "Students", accessor: "students" },
    { header: "Your Earnings", accessor: "revenue" },
  ];

  // Transaction history table columns (updated to match WalletPage)
  const transactionColumns: Column<Transaction>[] = [
    {
      header: "Date",
      accessor: (transaction) =>
        new Date(transaction.createdAt).toLocaleDateString(),
    },
    {
      header: "User Name",
      accessor: (transaction) => transaction.purchase_id?.userId?.name || "N/A",
    },
    {
      header: "Course Name",
      accessor: (transaction) =>
        transaction.purchase_id?.purchase?.[0]?.courseId?.title || "N/A",
    },
    { header: "Type", accessor: "transaction_type" },
    {
      header: "Amount",
      accessor: (transaction) =>
        transaction.transaction_type === "credit"
          ? `+₹${transaction.amount.toFixed(2)}`
          : `-₹${transaction.amount.toFixed(2)}`,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground font-medium text-sm">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-3">
        <div className="text-center max-w-md mx-auto p-4 bg-card rounded-lg shadow-lg">
          <p className="text-red-500 mb-4 font-medium text-sm">{error}</p>
          <Button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchDashboardData();
            }}
            className="hover:scale-105 transition-transform text-xs px-3 py-1"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (
    !stats ||
    !students ||
    !courseStats ||
    walletBalance === null ||
    !transactions
  ) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-3">
        <div className="text-center">
          <Users className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium text-xs sm:text-sm">
            No data available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className={`flex-1 ${sidebarOpen ? "md:ml-64" : ""}`}>
          <div className="container py-4 px-3 sm:px-4 md:px-6 lg:px-8 max-w-full mx-auto overflow-x-hidden">
            <div className="mb-3 sm:mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Welcome back, {user?.name || "Tutor"}
              </h1>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm md:text-base">
                Here's what's happening with your students today.
              </p>
            </div>

            <Separator className="my-3 sm:my-4 md:my-6" />

            {/* Stats Overview with improved cards */}
            <div className="mb-4 sm:mb-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="overflow-hidden transition-all hover:shadow-lg"
                >
                  <CardContent className="flex items-center justify-between p-3 sm:p-4">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-lg sm:text-xl md:text-3xl font-bold tracking-tight">
                        {stat.value}
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-2 sm:p-3">
                      {stat.icon}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Course Stats with improved styling */}
            <Card className="mb-4 sm:mb-6 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="text-lg sm:text-xl md:text-2xl">
                  Course Enrollment
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base">
                  Overview of student enrollments by course
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                {courseStats.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <Users className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium text-xs sm:text-sm">
                      No courses have enrolled students yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border shadow-sm">
                    <div className="min-w-[500px]">
                      <ReusableTable
                        columns={courseColumns}
                        data={courseStats}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-3 py-2 sm:px-4 sm:py-3">
                <Button
                  variant="outline"
                  className="w-full text-xs sm:text-sm md:text-base hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => navigate("/tutor/courses")}
                >
                  View All Courses
                </Button>
              </CardFooter>
            </Card>

            {/* Wallet Transaction History */}
            <Card className="mb-4 sm:mb-6 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="text-lg sm:text-xl md:text-2xl">
                  Wallet Transaction History
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base">
                  History of your wallet transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                {transactions.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <History className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium text-xs sm:text-sm">
                      No transactions yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border shadow-sm">
                    <div className="min-w-[500px]">
                      <ReusableTable
                        columns={transactionColumns}
                        data={transactions}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-3 py-2 sm:px-4 sm:py-3">
                <Button
                  variant="outline"
                  className="w-full text-xs sm:text-sm md:text-base hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => navigate("/tutor/wallet")}
                >
                  View All Transactions
                </Button>
              </CardFooter>
            </Card>

            {/* Student List with improved styling */}
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="text-lg sm:text-xl md:text-2xl">
                  Your Students
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base">
                  List of students enrolled in your courses
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                {students.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <Users className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium text-xs sm:text-sm">
                      No students have enrolled yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border shadow-sm">
                    <div className="min-w-[500px]">
                      <ReusableTable columns={studentColumns} data={students} />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-3 py-2 sm:px-4 sm:py-3">
                <Button
                  variant="outline"
                  className="w-full text-xs sm:text-sm md:text-base hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => navigate("/tutor/students")}
                >
                  View All Students
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
