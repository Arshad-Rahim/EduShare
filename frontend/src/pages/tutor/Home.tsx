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
import  Header  from "./components/Header";
import  SideBar  from "./components/SideBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

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
            <TableHead key={index} className="text-sm whitespace-nowrap">
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
                <TableCell key={colIndex} className="text-sm whitespace-nowrap">
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
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: "Your Earnings",
          value: `₹${tutorShare.toFixed(2)}`,
          icon: <BarChart3 className="h-5 w-5" />,
        },
        {
          title: "Wallet Balance",
          value: `₹${balance.toFixed(2)}`,
          icon: <Wallet className="h-5 w-5" />,
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col w-full">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col md:flex-row gap-6 p-6 w-full">
        <div className="w-full md:w-64 flex-shrink-0">
          <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
        <div
          className={`flex-1 w-full relative ${sidebarOpen ? "md:ml-64" : ""}`}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50 w-full">
              <ClipLoader size={50} color="#3b82f6" />
            </div>
          )}
          {error ? (
            <div className="flex items-center justify-center h-full w-full">
              <Card className="border-0 shadow-md w-full max-w-md">
                <CardContent className="pt-6 text-center">
                  <p className="text-red-500 mb-4 font-medium">{error}</p>
                  <Button
                    onClick={() => {
                      setLoading(true);
                      setError(null);
                      fetchDashboardData();
                    }}
                    className="bg-primary hover:bg-primary/90 text-white shadow-sm"
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : !stats ||
            !students ||
            !courseStats ||
            walletBalance === null ||
            !transactions ? (
            <div className="flex items-center justify-center h-full w-full">
              <Card className="border-0 shadow-md w-full max-w-md">
                <CardContent className="pt-6 text-center">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">
                    No data available.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-8 w-full">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Welcome back, {user?.name || "Tutor"}
                </h1>
                <p className="text-slate-600 mt-1">
                  Here's what's happening with your students today.
                </p>
              </div>

              {/* Stats Overview */}
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
                {stats.map((stat, index) => (
                  <Card
                    key={index}
                    className="border border-slate-200 transition-all duration-300 hover:shadow-lg w-full"
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-xl font-bold text-slate-800">
                          {stat.value}
                        </p>
                      </div>
                      <div className="rounded-full bg-primary/10 p-3">
                        {stat.icon}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Course Stats */}
              <Card className="border-0 shadow-md w-full">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
                  <CardTitle className="text-xl font-bold text-slate-800">
                    Course Enrollment
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Overview of student enrollments by course
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 w-full">
                  {courseStats.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 w-full">
                      <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">
                        No courses have enrolled students yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <ReusableTable
                        columns={courseColumns}
                        data={courseStats}
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/5"
                    onClick={() => navigate("/tutor/courses")}
                  >
                    View All Courses
                  </Button>
                </CardFooter>
              </Card>

              {/* Wallet Transaction History */}
              <Card className="border-0 shadow-md w-full">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
                  <CardTitle className="text-xl font-bold text-slate-800">
                    Wallet Transaction History
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    History of your wallet transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 w-full">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 w-full">
                      <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">
                        No transactions yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <ReusableTable
                        columns={transactionColumns}
                        data={transactions}
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/5"
                    onClick={() => navigate("/tutor/wallet")}
                  >
                    View All Transactions
                  </Button>
                </CardFooter>
              </Card>

              {/* Student List */}
              <Card className="border-0 shadow-md w-full">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
                  <CardTitle className="text-xl font-bold text-slate-800">
                    Your Students
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    List of students enrolled in your courses
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 w-full">
                  {students.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 w-full">
                      <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">
                        No students have enrolled yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <ReusableTable columns={studentColumns} data={students} />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/5"
                    onClick={() => navigate("/tutor/students")}
                  >
                    View All Students
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
