"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  MoreHorizontal,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "./components/admin/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SideBar } from "./components/admin/SideBar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { userService } from "@/services/adminService/userService";
import { tutorService } from "@/services/adminService/tutorService";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";
import { walletService } from "@/services/walletService";
import { courseService } from "@/services/courseService";
import { purchaseService } from "@/services/purchaseService";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement
);

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
            <TableHead key={index}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column, colIndex) => (
              <TableCell key={colIndex}>
                {typeof column.accessor === "function"
                  ? column.accessor(item)
                  : item[column.accessor as keyof T]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface Stat {
  title: string;
  value: string;
  icon: React.ReactNode;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: "Student" | "Tutor";
  status: "Active" | "Blocked";
  joined: string;
  lastLogin: string;
  avatar?: string;
}

interface CourseStatus {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface PerformanceMetric {
  enrollment: {
    value: number;
    categories: { name: string; value: string }[];
  };
  revenue: {
    value: number;
  };
}

interface TStudent {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  lastActive: string;
  enrolledCourses: number;
}

interface TTutor {
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

interface CoursePurchaseCount {
  courseId: string;
  courseName: string;
  purchaseCount: number;
}

interface TrendingTutor {
  tutorId: string;
  tutorName: string;
  enrollmentCount: number;
}

interface Purchase {
  _id: string;
  userId: string;
  purchase: {
    courseId: string;
    orderId: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
}

interface PurchaseApiResponse {
  success: boolean;
  message: string;
  purchases: Purchase[];
}

export function AdminHome() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<Stat[] | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [tutors, setTutors] = useState<TTutor[] | null>(null);
  const [courseStatuses, setCourseStatuses] = useState<CourseStatus[] | null>(
    null
  );
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetric | null>(null);
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [coursePurchaseCounts, setCoursePurchaseCounts] = useState<
    CoursePurchaseCount[] | null
  >(null);
  const [trendingTutors, setTrendingTutors] = useState<TrendingTutor[] | null>(
    null
  );
  const [purchases, setPurchases] = useState<Purchase[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const pageSize = 5;
  const user = useSelector((state: any) => state.admin.adminDatas);

  const [studentsData, setStudentsData] = useState<TStudent[]>([]);
  const [tutorsData, setTutorsData] = useState<TTutor[]>([]);

  const [period1, setPeriod1] = useState<{
    year: string;
    month: string;
    date: string;
  }>({ year: "", month: "", date: "" });
  const [period2, setPeriod2] = useState<{
    year: string;
    month: string;
    date: string;
  }>({ year: "", month: "", date: "" });
  const [salesComparisonData, setSalesComparisonData] = useState<any>(null);

  const fetchDashboardData = async () => {
    console.log("fetchDashboardData called");
    console.log("User:", user);

    if (!user?.id) {
      console.warn("No user.id, cannot fetch data");
      setError("User not authenticated. Please log in.");
      setLoading(false);
      toast.error("Please log in to view dashboard");
      return;
    }

    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Fetch wallet, course, purchase, and tutor data
      const walletResponse = await walletService.getWalletData();
      const courseCountResponse = await courseService.courseCount();
      const coursePurchaseCountResponse =
        await purchaseService.coursePurchaseCount();
      const trendingTutorsResponse = await tutorService.trendingTutors();
      const purchasesResponse =
        await authAxiosInstance.get<PurchaseApiResponse>("/purchase/all", {
          signal: controller.signal,
        });

      // Fetch user data (students and tutors)
      const [studentResponse, tutorResponse] = await Promise.all([
        userService.userList(1, 100, "", { signal: controller.signal }),
        tutorService.userList(1, 100, "", { signal: controller.signal }),
      ]);

      const students: TStudent[] =
        studentResponse.data.users.filter((u) => u.role === "user") || [];
      const tutors: TTutor[] =
        tutorResponse.data.users.filter((t) => t.role === "tutor") || [];

      setStudentsData(students);
      setTutorsData(tutors);
      setTutors(tutors);

      // Calculate total users (students + tutors)
      const totalUsersCount = students.length + tutors.length;

      // Populate initial user list for "User Management" section
      let filteredUsers: User[] = [];
      if (roleFilter === "all") {
        filteredUsers = [
          ...students.map((s) => ({
            _id: s._id,
            name: s.name,
            email: s.email,
            role: "Student" as const,
            status: s.isBlocked ? ("Blocked" as const) : ("Active" as const),
            joined: s.lastActive,
            lastLogin: s.lastActive,
            avatar: undefined,
          })),
          ...tutors.map((t) => ({
            _id: t._id,
            name: t.name,
            email: t.email,
            role: "Tutor" as const,
            status:
              t.isBlocked || t.approvalStatus !== "approved"
                ? ("Blocked" as const)
                : ("Active" as const),
            joined: t.lastActive,
            lastLogin: t.lastActive,
            avatar: undefined,
          })),
        ];
      } else if (roleFilter === "students") {
        filteredUsers = students.map((s) => ({
          _id: s._id,
          name: s.name,
          email: s.email,
          role: "Student" as const,
          status: s.isBlocked ? ("Blocked" as const) : ("Active" as const),
          joined: s.lastActive,
          lastLogin: s.lastActive,
          avatar: undefined,
        }));
      } else if (roleFilter === "tutors") {
        filteredUsers = tutors.map((t) => ({
          _id: t._id,
          name: t.name,
          email: t.email,
          role: "Tutor" as const,
          status:
            t.isBlocked || t.approvalStatus !== "approved"
              ? ("Blocked" as const)
              : ("Active" as const),
          joined: t.lastActive,
          lastLogin: t.lastActive,
          avatar: undefined,
        }));
      }

      const paginatedUsers = filteredUsers.slice(
        (page - 1) * pageSize,
        page * pageSize
      );
      setUsers(paginatedUsers);
      setTotalUsers(filteredUsers.length);

      // Calculate enrollment metrics
      const totalEnrollments = students.reduce(
        (sum, s) => sum + (Number(s.enrolledCourses) || 0),
        0
      );

      const courseMap = students.reduce(
        (acc: any, student: TStudent) => {
          const course =
            (Number(student.enrolledCourses) || 0) > 0
              ? `Course ${acc.count || 1}`
              : "Unknown";
          if (!acc[course]) {
            acc[course] = { count: 0 };
            acc.count = (acc.count || 0) + 1;
          }
          acc[course].count += Number(student.enrolledCourses) || 0;
          return acc;
        },
        { count: 0 }
      );

      const categories = Object.keys(courseMap)
        .filter((key) => key !== "count")
        .map((course) => ({
          name: course,
          value: `${(
            (courseMap[course].count / (totalEnrollments || 1)) *
            100
          ).toFixed(1)}%`,
        }))
        .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
        .slice(0, 3);

      console.log("WALLET RESPONSE", walletResponse);
      let wallet = walletResponse.data.wallet || null;
      let transactionsData: Transaction[] = [];
      let walletId = wallet ? wallet._id : null;

      if (walletId) {
        const transactionsResponse = await authAxiosInstance.get(
          `/transaction/transaction-details?walletId=${walletId}`,
          { signal: controller.signal }
        );
        transactionsData = transactionsResponse.data.transactions || [];
      } else {
        console.log(
          "No wallet exists for this admin, skipping transactions fetch"
        );
      }

      if (!purchasesResponse.data.success) {
        throw new Error(
          purchasesResponse.data.message || "Failed to fetch purchases"
        );
      }

      clearTimeout(timeoutId);
      console.log("Wallet Response:", walletResponse.data);
      console.log("Transactions Data:", transactionsData);
      console.log("Course Count Response:", courseCountResponse.data);
      console.log(
        "Course Purchase Count Response:",
        coursePurchaseCountResponse.data
      );
      console.log("Trending Tutors Response:", trendingTutorsResponse.data);
      console.log("Purchases Response:", purchasesResponse.data);
      console.log("Student Response:", studentResponse.data);
      console.log("Tutor Response:", tutorResponse.data);

      setWalletData(wallet);
      setTransactions(transactionsData);
      setCoursePurchaseCounts(
        coursePurchaseCountResponse.data.coursePurchaseCount || []
      );
      setTrendingTutors(trendingTutorsResponse.data.tutorPurchaseCount || []);
      setPurchases(purchasesResponse.data.purchases ?? []);

      // Calculate total revenue from purchasesResponse directly
      const totalRevenue =
        purchasesResponse.data.purchases
          ?.flatMap((p) => p.purchase)
          ?.reduce((sum, pur) => sum + pur.amount, 0) || 0;

      const uniqueCourses = courseCountResponse?.data.courseCount || 0;

      setStats([
        {
          title: "Total Users",
          value: totalUsersCount.toLocaleString(),
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: "Active Courses",
          value: uniqueCourses.toString(),
          icon: <Layers className="h-5 w-5" />,
        },
        {
          title: "Total Revenue",
          value: `₹${totalRevenue.toLocaleString("en-IN")}`,
          icon: (
            <span className="h-5 w-5 flex items-center justify-center">₹</span>
          ),
        },
        {
          title: "Wallet Balance",
          value: wallet ? `₹${wallet.balance.toLocaleString("en-IN")}` : "₹0",
          icon: (
            <span className="h-5 w-5 flex items-center justify-center">₹</span>
          ),
        },
      ]);

      setCourseStatuses([
        {
          title: "Active",
          value: uniqueCourses,
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          color: "bg-green-50 border-green-200",
        },
      ]);

      setPerformanceMetrics({
        enrollment: {
          value: totalEnrollments,
          categories,
        },
        revenue: {
          value: totalRevenue,
        },
      });
    } catch (error: any) {
      console.error("Fetch error:", error);
      let errorMessage = "Failed to load dashboard data";
      if (error.name === "AbortError") {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.response) {
        errorMessage = `Server error: ${error.response.status} ${
          error.response.data?.message || ""
        }`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!user?.id) {
      console.warn("No user.id, cannot fetch users");
      toast.error("Please log in to view users");
      return;
    }

    try {
      setUserLoading(true);

      // Use already fetched students and tutors data
      const students = studentsData;
      const tutors = tutorsData;

      let filteredUsers: User[] = [];
      if (roleFilter === "all") {
        filteredUsers = [
          ...students.map((s) => ({
            _id: s._id,
            name: s.name,
            email: s.email,
            role: "Student" as const,
            status: s.isBlocked ? ("Blocked" as const) : ("Active" as const),
            joined: s.lastActive,
            lastLogin: s.lastActive,
            avatar: undefined,
          })),
          ...tutors.map((t) => ({
            _id: t._id,
            name: t.name,
            email: t.email,
            role: "Tutor" as const,
            status:
              t.isBlocked || t.approvalStatus !== "approved"
                ? ("Blocked" as const)
                : ("Active" as const),
            joined: t.lastActive,
            lastLogin: t.lastActive,
            avatar: undefined,
          })),
        ];
      } else if (roleFilter === "students") {
        filteredUsers = students.map((s) => ({
          _id: s._id,
          name: s.name,
          email: s.email,
          role: "Student" as const,
          status: s.isBlocked ? ("Blocked" as const) : ("Active" as const),
          joined: s.lastActive,
          lastLogin: s.lastActive,
          avatar: undefined,
        }));
      } else if (roleFilter === "tutors") {
        filteredUsers = tutors.map((t) => ({
          _id: t._id,
          name: t.name,
          email: t.email,
          role: "Tutor" as const,
          status:
            t.isBlocked || t.approvalStatus !== "approved"
              ? ("Blocked" as const)
              : ("Active" as const),
          joined: t.lastActive,
          lastLogin: t.lastActive,
          avatar: undefined,
        }));
      }

      const paginatedUsers = filteredUsers.slice(
        (page - 1) * pageSize,
        page * pageSize
      );
      setUsers(paginatedUsers);
      setTotalUsers(filteredUsers.length);

      // Update stats with the filtered users count
      if (stats) {
        setStats(
          (prevStats) =>
            prevStats?.map((stat) =>
              stat.title === "Total Users"
                ? { ...stat, value: filteredUsers.length.toLocaleString() }
                : stat
            ) || null
        );
      }

      console.log("Users:", paginatedUsers);
    } catch (error: any) {
      console.error("Fetch users error:", error);
      let errorMessage = "Failed to load users";
      if (error.name === "AbortError") {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.response) {
        errorMessage = `Server error: ${error.response.status} ${
          error.response.data?.message || ""
        }`;
      }
      toast.error(errorMessage);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect for fetchDashboardData ran, user.id:", user?.id);
    if (user?.id) {
      fetchDashboardData();
    } else {
      console.warn("No user.id in useEffect, setting loading false");
      setError("User not authenticated. Please log in.");
      setLoading(false);
      toast.error("Please log in to view dashboard");
    }
  }, [user?.id]);

  useEffect(() => {
    console.log(
      "useEffect for fetchUsers ran, user.id:",
      user?.id,
      "roleFilter:",
      roleFilter,
      "page:",
      page
    );
    if (user?.id && studentsData.length > 0 && tutorsData.length > 0) {
      fetchUsers();
    }
  }, [user?.id, roleFilter, page, studentsData, tutorsData]);

  const userDistributionData = {
    labels: ["Students", "Tutors"],
    datasets: [
      {
        data: [studentsData.length, tutorsData.length],
        backgroundColor: ["#34D399", "#F87171"],
        borderColor: ["#2FBC85", "#EF4444"],
        borderWidth: 1,
      },
    ],
  };

  const getLastSixMonths = () => {
    const months: string[] = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i
      );
      months.push(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      );
    }
    return months;
  };

  const revenueTrendData = {
    labels: getLastSixMonths(),
    datasets: [
      {
        label: "Revenue (₹)",
        data: getLastSixMonths().map((month) => {
          const revenue =
            purchases
              ?.flatMap((p) => p.purchase)
              ?.filter((pur) => {
                const purchaseMonth = new Date(pur.createdAt)
                  .toISOString()
                  .slice(0, 7);
                return purchaseMonth === month;
              })
              ?.reduce((sum, pur) => sum + pur.amount, 0) || 0;
          return revenue;
        }),
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "#3B82F6",
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const topTransactions =
    transactions
      ?.filter((t) => t.transaction_type === "credit")
      ?.sort((a, b) => b.amount - a.amount)
      ?.slice(0, 5) || [];

  const topTransactionsData = {
    labels: topTransactions.map((t) => t.transactionId.slice(0, 8) + "..."),
    datasets: [
      {
        label: "Revenue (₹)",
        data: topTransactions.map((t) => t.amount),
        backgroundColor: "#FBBF24",
        borderColor: "#F59E0B",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const pieChartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: {
            size: 12,
            weight: "500",
          },
          padding: 20,
          color: "#4B5563",
        },
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleFont: { size: 14, weight: "600" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (sum: number, val: number) => sum + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  const lineChartOptions = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Revenue (₹)",
          font: { size: 12, weight: "500" },
          color: "#4B5563",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: "#6B7280",
          callback: (value: any) => `₹${value.toLocaleString("en-IN")}`,
        },
      },
      x: {
        title: {
          display: true,
          text: "Month",
          font: { size: 12, weight: "500" },
          color: "#4B5563",
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          font: { size: 12, weight: "500" },
          color: "#4B5563",
        },
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleFont: { size: 14, weight: "600" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (context: any) => {
            const value = context.raw || 0;
            return `Revenue: ₹${value.toLocaleString("en-IN")}`;
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  const barChartOptions = {
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Revenue (₹)",
          font: { size: 12, weight: "500" },
          color: "#4B5563",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: "#6B7280",
          callback: (value: any) => `₹${value.toLocaleString("en-IN")}`,
        },
      },
      y: {
        title: {
          display: true,
          text: "Transaction ID",
          font: { size: 12, weight: "500" },
          color: "#4B5563",
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleFont: { size: 14, weight: "600" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (context: any) => {
            const value = context.raw || 0;
            return `Revenue: ₹${value.toLocaleString("en-IN")}`;
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  const trendingCoursesChartOptions = {
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Enrollments",
          font: { size: 12, weight: "500" },
          color: "#4B5563",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: "#6B7280",
        },
      },
      y: {
        title: {
          display: true,
          text: "Course Name",
          font: { size: 12, weight: "500" },
          color: "#4B5563",
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleFont: { size: 14, weight: "600" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (context: any) => {
            const value = context.raw || 0;
            return `Enrollments: ${value}`;
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  const trendingTutorsChartOptions = {
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Total Enrollments",
          font: { size: 12, weight: "500" },
          color: "#4B5563",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: "#6B7280",
        },
      },
      y: {
        title: {
          display: true,
          text: "Tutor Name",
          font: { size: 12, weight: "500" },
          color: "#4B5563",
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleFont: { size: 14, weight: "600" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (context: any) => {
            const value = context.raw || 0;
            return `Total Enrollments: ${value}`;
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  const salesComparisonChartOptions = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Sales (₹)",
          font: { size: 12, weight: "500" },
          color: "#4B5563",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: "#6B7280",
          callback: (value: any) => `₹${value.toLocaleString("en-IN")}`,
        },
      },
      x: {
        title: {
          display: true,
          text: "Period",
          font: { size: 12, weight: "500" },
          color: "#4B5563",
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleFont: { size: 14, weight: "600" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (context: any) => {
            const value = context.raw || 0;
            return `Sales: ₹${value.toLocaleString("en-IN")}`;
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  const userColumns: Column<User>[] = [
    {
      header: "User",
      accessor: (user) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (user) => (
        <Badge variant="outline" className="border-green-200 bg-green-50">
          {user.role}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessor: (user) => (
        <div className="flex items-center gap-1">
          <CheckCircle2
            className={`h-4 w-4 ${
              user.status === "Active" ? "text-green-500" : "text-red-500"
            }`}
          />
          <span
            className={
              user.status === "Active" ? "text-green-600" : "text-red-600"
            }
          >
            {user.status}
          </span>
        </div>
      ),
    },
    {
      header: "Joined",
      accessor: (user) => new Date(user.joined).toLocaleDateString(),
    },
    {
      header: "Last Login",
      accessor: (user) => new Date(user.lastLogin).toLocaleString(),
    },
    {
      header: "Actions",
      accessor: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>Edit User</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Suspend User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const topTrendingCourses = coursePurchaseCounts
    ? coursePurchaseCounts.slice(0, 5)
    : [];

  const topTrendingTutors = trendingTutors ? trendingTutors.slice(0, 5) : [];

  const trendingCoursesData = {
    labels: topTrendingCourses.map((course) => course.courseName),
    datasets: [
      {
        label: "Enrollments",
        data: topTrendingCourses.map((course) => course.purchaseCount),
        backgroundColor: "#60A5FA",
        borderColor: "#3B82F6",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const trendingTutorsData = {
    labels: topTrendingTutors.map((tutor) => tutor.tutorName),
    datasets: [
      {
        label: "Total Enrollments",
        data: topTrendingTutors.map((tutor) => tutor.enrollmentCount),
        backgroundColor: "#34D399",
        borderColor: "#2FBC85",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // Sales Comparison Logic
  const years = Array.from(
    new Set(
      purchases?.flatMap((p) =>
        p.purchase.map((pur) =>
          new Date(pur.createdAt).getFullYear().toString()
        )
      ) || []
    )
  ).sort((a, b) => parseInt(b) - parseInt(a));

  const months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  const getDaysInMonth = (year: string, month: string) => {
    if (!year || !month) return [];
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) =>
      (i + 1).toString().padStart(2, "0")
    );
  };

  const handleCompareSales = () => {
    if (!period1.year || !period2.year) {
      toast.error("Please select years for both periods.");
      return;
    }

    const filterPurchasesByPeriod = (
      period: { year: string; month: string; date: string },
      periodLabel: string
    ) => {
      let filteredPurchases: { amount: number; createdAt: string }[] = [];

      // Flatten the purchases array
      console.log("Initial purchases:", purchases);
      purchases?.forEach((p) => {
        p.purchase.forEach((pur) => {
          filteredPurchases.push({
            amount: pur.amount,
            createdAt: pur.createdAt,
          });
        });
      });

      console.log("Filtered purchases (after flattening):", filteredPurchases);

      const purchaseDate = (p: { createdAt: string }) => new Date(p.createdAt);

      // Filter by year
      filteredPurchases = filteredPurchases.filter(
        (p) => purchaseDate(p).getFullYear().toString() === period.year
      );
      console.log("Filtered purchases (after year):", filteredPurchases);

      // Filter by month if selected
      if (period.month) {
        filteredPurchases = filteredPurchases.filter(
          (p) =>
            (purchaseDate(p).getMonth() + 1).toString().padStart(2, "0") ===
            period.month
        );
        console.log("Filtered purchases (after month):", filteredPurchases);
      }

      // Filter by date if selected
      if (period.date) {
        filteredPurchases = filteredPurchases.filter(
          (p) =>
            purchaseDate(p).getDate().toString().padStart(2, "0") ===
            period.date
        );
        console.log("Filtered purchases (after date):", filteredPurchases);
      }

      const totalSales = filteredPurchases.reduce(
        (sum, p) => sum + p.amount,
        0
      );
      console.log(`Total sales for ${periodLabel}:`, totalSales);

      let label = period.year;
      if (period.month) label += `-${period.month}`;
      if (period.date) label += `-${period.date}`;
      else label = `${periodLabel} (${label})`;

      return { totalSales, label };
    };

    const period1Data = filterPurchasesByPeriod(period1, "Period 1");
    const period2Data = filterPurchasesByPeriod(period2, "Period 2");

    // Check if both periods have zero sales
    if (period1Data.totalSales === 0 && period2Data.totalSales === 0) {
      toast.info("No sales data available for the selected periods.");
      setSalesComparisonData(null); // Reset the chart data
      return;
    }

    setSalesComparisonData({
      labels: [period1Data.label, period2Data.label],
      datasets: [
        {
          label: "Sales (₹)",
          data: [period1Data.totalSales, period2Data.totalSales],
          backgroundColor: ["#F87171", "#34D399"],
          borderColor: ["#EF4444", "#2FBC85"],
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg">
          <p className="text-red-500 mb-4 font-medium">{error}</p>
          <Button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchDashboardData();
            }}
            className="hover:scale-105 transition-transform"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!stats || !courseStatuses || !performanceMetrics || !transactions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            No data available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
      <div className="flex">
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } fixed inset-y-0 left-0 top-16 z-30 w-64 shrink-0 border-r bg-background pt-4 md:block`}
        >
          <SideBar />
        </aside>
        <main className={`flex-1 ${sidebarOpen ? "md:ml-64" : ""}`}>
          <div className="container py-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">
                Welcome, {user?.name || "Admin"}
              </h1>
              <p className="text-muted-foreground">
                Overview and management of the TechLearn platform.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.length > 0 ? (
                stats.map((stat, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden transition-all hover:shadow-lg"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="rounded-full bg-primary/10 p-2">
                          {stat.icon}
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center col-span-4 py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">
                    No stats available.
                  </p>
                </div>
              )}
            </div>

            {/* Platform Insights Section with Multiple Graphs */}
            <Card className="mt-8 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle>Platform Insights</CardTitle>
                <CardDescription>
                  Visual insights into platform users and revenue
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">
                        User Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {studentsData.length > 0 || tutorsData.length > 0 ? (
                        <div className="h-[280px]">
                          <Pie
                            data={userDistributionData}
                            options={pieChartOptions}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground font-medium">
                            No user data available
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={fetchUsers}
                          >
                            Refresh Data
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">
                        Revenue Trend (Last 6 Months)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {revenueTrendData.datasets[0].data.some(
                        (value) => value > 0
                      ) ? (
                        <div className="h-[280px]">
                          <Line
                            data={revenueTrendData}
                            options={lineChartOptions}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground font-medium">
                            No revenue data available
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={fetchDashboardData}
                          >
                            Refresh Data
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">
                        Top Revenue Transactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {topTransactions.length > 0 ? (
                        <div className="h-[280px]">
                          <Bar
                            data={topTransactionsData}
                            options={barChartOptions}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground font-medium">
                            No transaction data available
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={fetchDashboardData}
                          >
                            Refresh Data
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-4"></CardFooter>
            </Card>

            {/* User Management */}
            <Card className="mb-8 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardHeader className="border-b bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage all users on the platform
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={roleFilter}
                      onValueChange={(value) => {
                        setRoleFilter(value);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="students">Students</SelectItem>
                        <SelectItem value="tutors">Tutors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {userLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : users && users.length > 0 ? (
                  <div className="rounded-lg overflow-hidden border">
                    <ReusableTable columns={userColumns} data={users} />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">
                      No users found.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t bg-muted/50 flex items-center justify-between px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {users ? users.length : 0} of {totalUsers} users
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page * pageSize >= totalUsers}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Course Management and Analytics */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all">
                <CardHeader className="border-b bg-muted/50">
                  <CardTitle>Course Status</CardTitle>
                  <CardDescription>
                    Overview of all courses on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {courseStatuses.length > 0 ? (
                      courseStatuses.map((status, index) => (
                        <Card key={index} className={`border ${status.color}`}>
                          <CardContent className="flex flex-col items-center justify-center p-6">
                            {status.icon}
                            <p className="mt-2 text-2xl font-bold">
                              {status.value}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {status.title}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center col-span-2 py-12">
                        <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">
                          No course statuses available.
                        </p>
                      </div>
                    )}
                  </div>
                  <Separator className="my-6" />
                  <div className="space-y-3">
                    <h4 className="font-medium">Recent Transactions</h4>
                    {transactions.length > 0 ? (
                      transactions.slice(0, 3).map((transaction, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div>
                            <p className="font-medium">
                              {transaction.transactionId}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.description} •{" "}
                              {new Date(transaction.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                transaction.transaction_type === "credit"
                                  ? "bg-green-50 border-green-200 text-green-600"
                                  : "bg-red-50 border-red-200 text-red-600"
                              }
                            >
                              {transaction.transaction_type === "credit"
                                ? `+₹${transaction.amount.toFixed(2)}`
                                : `-₹${transaction.amount.toFixed(2)}`}
                            </Badge>
                            <Button size="sm">View</Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">
                          No recent transactions.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all">
                <CardHeader className="border-b bg-muted/50">
                  <CardTitle>Key Performance Metrics</CardTitle>
                  <CardDescription>
                    Platform analytics and trends
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs defaultValue="enrollment">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
                      <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    </TabsList>
                    <TabsContent value="enrollment" className="pt-4">
                      {performanceMetrics.enrollment.value > 0 ? (
                        <>
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-2xl font-bold">
                                {performanceMetrics.enrollment.value.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Total enrollments
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 h-[160px] rounded-md bg-muted/50 flex items-center justify-center">
                            <div className="text-muted-foreground">
                              Enrollment chart placeholder
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-medium">
                              Top Categories
                            </h4>
                            {performanceMetrics.enrollment.categories.length >
                            0 ? (
                              performanceMetrics.enrollment.categories.map(
                                (category, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between"
                                  >
                                    <div className="text-sm">
                                      {category.name}
                                    </div>
                                    <div className="text-sm font-medium">
                                      {category.value}
                                    </div>
                                  </div>
                                )
                              )
                            ) : (
                              <p className="text-muted-foreground">
                                No category data available.
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">
                            No enrollment data available.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="revenue" className="pt-4">
                      {performanceMetrics.revenue.value > 0 ? (
                        <>
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-2xl font-bold">
                                ₹
                                {performanceMetrics.revenue.value.toLocaleString(
                                  "en-IN"
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Total revenue
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 h-[160px] rounded-md bg-muted/50 flex items-center justify-center">
                            <div className="text-muted-foreground">
                              Revenue chart placeholder
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">
                            No revenue data available.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-4">
                  <Button
                    variant="outline"
                    className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    View Detailed Analytics
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Trending Courses Section */}
            <Card className="mt-8 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle>Trending Courses</CardTitle>
                <CardDescription>
                  Top courses by student enrollments
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {topTrendingCourses.length > 0 ? (
                  <div className="h-[300px]">
                    <Bar
                      data={trendingCoursesData}
                      options={trendingCoursesChartOptions}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">
                      No trending courses available
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={fetchDashboardData}
                    >
                      Refresh Data
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-4">
                <Button
                  variant="outline"
                  className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  View All Courses
                </Button>
              </CardFooter>
            </Card>

            {/* Trending Tutors Section */}
            <Card className="mt-8 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle>Trending Tutors</CardTitle>
                <CardDescription>
                  Top tutors by student enrollments in their courses
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {topTrendingTutors.length > 0 ? (
                  <div className="h-[300px]">
                    <Bar
                      data={trendingTutorsData}
                      options={trendingTutorsChartOptions}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">
                      No trending tutors available
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={fetchDashboardData}
                    >
                      Refresh Data
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-4">
                <Button
                  variant="outline"
                  className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  View All Tutors
                </Button>
              </CardFooter>
            </Card>

            {/* Sales Comparison Section */}
            <Card className="mt-8 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle>Sales Comparison</CardTitle>
                <CardDescription>
                  Compare sales revenue between two time periods
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Period 1 Selection */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Period 1</h4>
                    <div className="flex gap-2">
                      <Select
                        value={period1.year}
                        onValueChange={(value) =>
                          setPeriod1((prev) => ({
                            ...prev,
                            year: value,
                            month: "",
                            date: "",
                          }))
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={period1.month}
                        onValueChange={(value) =>
                          setPeriod1((prev) => ({
                            ...prev,
                            month: value,
                            date: "",
                          }))
                        }
                        disabled={!period1.year}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={period1.date}
                        onValueChange={(value) =>
                          setPeriod1((prev) => ({ ...prev, date: value }))
                        }
                        disabled={!period1.year || !period1.month}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Date" />
                        </SelectTrigger>
                        <SelectContent>
                          {getDaysInMonth(period1.year, period1.month).map(
                            (day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Period 2 Selection */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Period 2</h4>
                    <div className="flex gap-2">
                      <Select
                        value={period2.year}
                        onValueChange={(value) =>
                          setPeriod2((prev) => ({
                            ...prev,
                            year: value,
                            month: "",
                            date: "",
                          }))
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={period2.month}
                        onValueChange={(value) =>
                          setPeriod2((prev) => ({
                            ...prev,
                            month: value,
                            date: "",
                          }))
                        }
                        disabled={!period2.year}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={period2.date}
                        onValueChange={(value) =>
                          setPeriod2((prev) => ({ ...prev, date: value }))
                        }
                        disabled={!period2.year || !period2.month}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Date" />
                        </SelectTrigger>
                        <SelectContent>
                          {getDaysInMonth(period2.year, period2.month).map(
                            (day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button
                  className="mt-4 w-full md:w-auto"
                  onClick={handleCompareSales}
                >
                  Compare
                </Button>

                {/* Sales Comparison Chart */}
                <div className="mt-6">
                  {salesComparisonData ? (
                    salesComparisonData.datasets[0].data.some(
                      (value: number) => value > 0
                    ) ? (
                      <div className="h-[300px]">
                        <Bar
                          data={salesComparisonData}
                          options={salesComparisonChartOptions}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground font-medium">
                          No sales data available for the selected periods
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground font-medium">
                        Select periods to compare sales
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-4">
                <Button
                  variant="outline"
                  className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    setPeriod1({ year: "", month: "", date: "" });
                    setPeriod2({ year: "", month: "", date: "" });
                    setSalesComparisonData(null);
                  }}
                >
                  Reset Comparison
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
