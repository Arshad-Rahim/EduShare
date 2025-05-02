"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Layers,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  MoreHorizontal,
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
  change: string;
  changePercent: string;
  status: "increase" | "decrease";
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

interface CourseSubmission {
  _id: string;
  title: string;
  author: string;
  submitted: string;
  status: string;
}

interface PerformanceMetric {
  enrollment: {
    value: number;
    changePercent: string;
    status: "increase" | "decrease";
    categories: { name: string; growth: string; value: string }[];
  };
  revenue: {
    value: number;
    changePercent: string;
    status: "increase" | "decrease";
  };
  retention: {
    value: number;
    changePercent: string;
    status: "increase" | "decrease";
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

export function AdminHome() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<Stat[] | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [tutors, setTutors] = useState<TTutor[] | null>(null);
  const [courseStatuses, setCourseStatuses] = useState<CourseStatus[] | null>(
    null
  );
  const [courseSubmissions, setCourseSubmissions] = useState<
    CourseSubmission[] | null
  >(null);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetric | null>(null);
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const pageSize = 5;
  const user = useSelector((state: any) => state.admin.adminDatas);

  // Fetch dashboard data
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

      // Fetch students and tutors concurrently
      const [studentResponse, tutorResponse] = await Promise.all([
        userService.userList(1, 100, "", { signal: controller.signal }),
        tutorService.userList(1, 100, "", { signal: controller.signal }),
      ]);

      // Fetch wallet data
      const walletResponse = await authAxiosInstance.get("/wallet/get-data", {
        signal: controller.signal,
      });

      // Fetch transactions using the wallet ID
      let transactionsResponse = { data: { transactions: [] } };
      if (walletResponse?.data?.wallet?._id) {
        transactionsResponse = await authAxiosInstance.get(
          `/transaction/transaction-details?walletId=${walletResponse.data.wallet._id}`,
          { signal: controller.signal }
        );
      }

      clearTimeout(timeoutId);
      console.log("Student Response:", studentResponse.data);
      console.log("Tutor Response:", tutorResponse.data);
      console.log("Wallet Response:", walletResponse.data);
      console.log("Transactions Response:", transactionsResponse.data);

      const students: TStudent[] =
        studentResponse.data.users.filter((u) => u.role === "user") || [];
      const tutors: TTutor[] =
        tutorResponse.data.users.filter((t) => t.role === "tutor") || [];

      setTutors(tutors);

      // Set wallet data and transactions
      const wallet = walletResponse.data.wallet || null;
      setWalletData(wallet);
      setTransactions(transactionsResponse.data.transactions || []);

      // Derive total revenue (assume ₹1000 per enrollment)
      const totalRevenue = students.reduce(
        (sum, s) => sum + (Number(s.enrolledCourses) || 0) * 1000,
        0
      );

      // Derive unique courses (placeholder names based on enrollment counts)
      const uniqueCourses = students
        .filter((s) => (Number(s.enrolledCourses) || 0) > 0)
        .map((s, index) => `Course ${index + 1}`)
        .filter((value, index, self) => self.indexOf(value) === index);

      // Derive stats using walletResponse directly for balance
      setStats([
        {
          title: "Total Users",
          value: students.length.toLocaleString(),
          change: "+0", // Placeholder
          changePercent: "+0%",
          status: "increase",
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: "Active Courses",
          value: uniqueCourses.length.toString(),
          change: "+0",
          changePercent: "+0%",
          status: "increase",
          icon: <Layers className="h-5 w-5" />,
        },
        {
          title: "Total Revenue",
          value: `₹${totalRevenue.toLocaleString("en-IN")}`,
          change: "₹0",
          changePercent: "+0%",
          status: "increase",
          icon: (
            <span className="h-5 w-5 flex items-center justify-center">₹</span>
          ),
        },
        {
          title: "Wallet Balance",
          value: wallet ? `₹${wallet.balance.toLocaleString("en-IN")}` : "₹0",
          change: "₹0",
          changePercent: "+0%",
          status: "increase",
          icon: (
            <span className="h-5 w-5 flex items-center justify-center">₹</span>
          ),
        },
      ]);

      // Derive users based on role filter
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

      // Derive course statuses (assume all active)
      setCourseStatuses([
        {
          title: "Active",
          value: uniqueCourses.length,
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          color: "bg-green-50 border-green-200",
        },
        {
          title: "Pending Review",
          value: 0,
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          color: "bg-yellow-50 border-yellow-200",
        },
        {
          title: "Paused",
          value: 0,
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          color: "bg-blue-50 border-blue-200",
        },
        {
          title: "Rejected",
          value: 0,
          icon: <Clock className="h-5 w-5 text-red-500" />,
          color: "bg-red-50 border-red-200",
        },
      ]);

      // Derive course submissions (recent enrollments)
      const submissions = students
        .filter((s) => (Number(s.enrolledCourses) || 0) > 0)
        .sort(
          (a, b) =>
            new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
        )
        .slice(0, 3)
        .map((s, index) => ({
          _id: s._id,
          title: `Course ${index + 1}`,
          author:
            tutors.find((t) => t.approvalStatus === "approved")?.name ||
            "Unknown",
          submitted: s.lastActive,
          status: "Enrolled",
        }));
      setCourseSubmissions(submissions);

      // Derive performance metrics
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
          growth: "+0%", // Placeholder
          value: `${(
            (courseMap[course].count /
              students.reduce(
                (sum, s) => sum + (Number(s.enrolledCourses) || 0),
                0
              )) *
            100
          ).toFixed(1)}%`,
        }))
        .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
        .slice(0, 3);

      setPerformanceMetrics({
        enrollment: {
          value: students.length,
          changePercent: "+0%", // Placeholder
          status: "increase",
          categories,
        },
        revenue: {
          value: totalRevenue,
          changePercent: "+0%",
          status: "increase",
        },
        retention: {
          value: 76.4, // Hardcoded
          changePercent: "-0%",
          status: "decrease",
        },
      });

      console.log("Stats:", stats);
      console.log("Users:", paginatedUsers);
      console.log("Course Statuses:", courseStatuses);
      console.log("Course Submissions:", submissions);
      console.log("Performance Metrics:", performanceMetrics);
      console.log("Wallet Data:", walletData);
      console.log("Transactions:", transactions);
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
    if (user?.id) {
      fetchDashboardData();
    } else {
      console.warn("No user.id in useEffect, setting loading false");
      setError("User not authenticated. Please log in.");
      setLoading(false);
      toast.error("Please log in to view dashboard");
    }
  }, [user?.id, page, roleFilter]);

  // User table columns
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchDashboardData();
            }}
          >
            Retry
          </Button>
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
              {stats && stats.length > 0 ? (
                stats.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="rounded-full bg-primary/10 p-2">
                          {stat.icon}
                        </div>
                        <span
                          className={
                            stat.status === "increase"
                              ? "flex items-center text-sm font-medium text-green-500"
                              : "flex items-center text-sm font-medium text-red-500"
                          }
                        >
                          {stat.status === "increase" ? (
                            <ArrowUpRight className="mr-1 h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-4 w-4" />
                          )}
                          {stat.changePercent}
                        </span>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {stat.status === "increase" ? "+" : ""}
                          {stat.change} this month
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground col-span-4">
                  No stats available.
                </p>
              )}
            </div>

            {/* User Management */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage all users on the platform
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
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
              <CardContent>
                {users && users.length > 0 ? (
                  <ReusableTable columns={userColumns} data={users} />
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No users found.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {users?.length || 0} of {totalUsers} users
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
              <Card>
                <CardHeader>
                  <CardTitle>Course Status</CardTitle>
                  <CardDescription>
                    Overview of all courses on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {courseStatuses && courseStatuses.length > 0 ? (
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
                      <p className="text-muted-foreground col-span-2">
                        No course statuses available.
                      </p>
                    )}
                  </div>
                  <Separator className="my-6" />
                  <div className="space-y-3">
                    <h4 className="font-medium">Recent Course Enrollments</h4>
                    {courseSubmissions && courseSubmissions.length > 0 ? (
                      courseSubmissions.map((course, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-sm text-muted-foreground">
                              By {course.author} •{" "}
                              {new Date(course.submitted).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-green-50 border-green-200"
                            >
                              {course.status}
                            </Badge>
                            <Button size="sm">View</Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">
                        No recent enrollments.
                      </p>
                    )}
                  </div>
                  <Separator className="my-6" />
                  <div className="space-y-3">
                    <h4 className="font-medium">Recent Transactions</h4>
                    {transactions && transactions.length > 0 ? (
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
                      <p className="text-muted-foreground">
                        No recent transactions.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Metrics</CardTitle>
                  <CardDescription>
                    Platform analytics and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="enrollment">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
                      <TabsTrigger value="revenue">Revenue</TabsTrigger>
                      <TabsTrigger value="retention">Retention</TabsTrigger>
                    </TabsList>
                    <TabsContent value="enrollment" className="pt-4">
                      {performanceMetrics ? (
                        <>
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-2xl font-bold">
                                {performanceMetrics.enrollment.value.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                New enrollments this month
                              </div>
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                performanceMetrics.enrollment.status ===
                                "increase"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              <span className="flex items-center">
                                {performanceMetrics.enrollment.status ===
                                "increase" ? (
                                  <ArrowUpRight className="mr-1 h-4 w-4" />
                                ) : (
                                  <ArrowDownRight className="mr-1 h-4 w-4" />
                                )}
                                {performanceMetrics.enrollment.changePercent}
                              </span>
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
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-green-600">
                                        {category.growth}
                                      </span>
                                      <span className="text-sm font-medium">
                                        {category.value}
                                      </span>
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
                        <p className="text-muted-foreground">
                          No enrollment data available.
                        </p>
                      )}
                    </TabsContent>
                    <TabsContent value="revenue" className="pt-4">
                      {performanceMetrics ? (
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
                                Revenue this month
                              </div>
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                performanceMetrics.revenue.status === "increase"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              <span className="flex items-center">
                                {performanceMetrics.revenue.status ===
                                "increase" ? (
                                  <ArrowUpRight className="mr-1 h-4 w-4" />
                                ) : (
                                  <ArrowDownRight className="mr-1 h-4 w-4" />
                                )}
                                {performanceMetrics.revenue.changePercent}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 h-[160px] rounded-md bg-muted/50 flex items-center justify-center">
                            <div className="text-muted-foreground">
                              Revenue chart placeholder
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted-foreground">
                          No revenue data available.
                        </p>
                      )}
                    </TabsContent>
                    <TabsContent value="retention" className="pt-4">
                      {performanceMetrics ? (
                        <>
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-2xl font-bold">
                                {performanceMetrics.retention.value.toFixed(1)}%
                              </div>
                              <div className="text-sm text-muted-foreground">
                                30-day retention rate
                              </div>
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                performanceMetrics.retention.status ===
                                "increase"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              <span className="flex items-center">
                                {performanceMetrics.retention.status ===
                                "increase" ? (
                                  <ArrowUpRight className="mr-1 h-4 w-4" />
                                ) : (
                                  <ArrowDownRight className="mr-1 h-4 w-4" />
                                )}
                                {performanceMetrics.retention.changePercent}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 h-[160px] rounded-md bg-muted/50 flex items-center justify-center">
                            <div className="text-muted-foreground">
                              Retention chart placeholder
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted-foreground">
                          No retention data available.
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Detailed Analytics
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
