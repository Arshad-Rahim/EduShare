
"use client";

import { useState, useEffect } from "react";
import { Users, BarChart3 } from "lucide-react";
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

// ... keep existing code (ReusableTable component and interfaces)

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


interface TStudent {
  _id: string;
  name: string;
  email: string;
  role: string;
  course: string;
  purchaseDate: string; // Changed to string for flexibility
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

export function TutorHome() {
  // ... keep existing code (state declarations and fetchDashboardData function)
   const [sidebarOpen] = useState(true);
   const [students, setStudents] = useState<TStudent[] | null>(null);
   const [totalRevenue, setTotalRevenue] = useState(0);
   const [stats, setStats] = useState<Stat[] | null>(null);
   const [courseStats, setCourseStats] = useState<CourseStat[] | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const user = useSelector((state: any) => state.user.userDatas);
   const userId = user?.id ? user?.id : user?._id;
   // Fetch students data with timeout
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
       // Add timeout to prevent hanging
       const controller = new AbortController();
       const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

       const response = await authAxiosInstance.get("/tutors/students", {
         signal: controller.signal,
       });
       clearTimeout(timeoutId);

       console.log("Response:", response.data);

       // Handle response safely
       const studentsData = response.data?.students || [];
       const revenue = response.data?.totalRevenue || 0;

       setStudents(studentsData);
       setTotalRevenue(revenue);

       // Calculate stats
       setStats([
         {
           title: "Active Students",
           value: studentsData.length.toString(),
           icon: <Users className="h-5 w-5" />,
         },
         {
           title: "Total Revenue",
           value: `₹${revenue.toFixed(2)}`,
           icon: <BarChart3 className="h-5 w-5" />,
         },
       ]);

       // Calculate course stats
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
         revenue: `₹${courseMap[course].amount.toFixed(2)}`,
       }));
       setCourseStats(courseStatsData);
       console.log("Stats:", stats);
       console.log("Course Stats:", courseStatsData);
       console.log("Students:", studentsData);
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
     { header: "Revenue", accessor: "revenue" },
   ];

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

  if (!stats || !students || !courseStats) {
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
      <Header />
      <div className="flex">
        <SideBar sidebarOpen={sidebarOpen} />
        <main className={`flex-1 ${sidebarOpen ? "md:ml-64" : ""}`}>
          <div className="container py-8 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-4xl font-bold tracking-tight">
                Welcome back, {user?.name || "Tutor"}
              </h1>
              <p className="text-muted-foreground mt-2">
                Here's what's happening with your students today.
              </p>
            </div>

            <Separator className="my-6" />

            {/* Stats Overview with improved cards */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="overflow-hidden transition-all hover:shadow-lg"
                >
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold tracking-tight">
                        {stat.value}
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-4">
                      {stat.icon}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Course Stats with improved styling */}
            <Card className="mb-8 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="text-2xl">Course Enrollment</CardTitle>
                <CardDescription>
                  Overview of student enrollments by course
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {courseStats.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">
                      No courses have enrolled students yet.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden border">
                    <ReusableTable columns={courseColumns} data={courseStats} />
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

            {/* Student List with improved styling */}
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="text-2xl">Your Students</CardTitle>
                <CardDescription>
                  List of students enrolled in your courses
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {students.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">
                      No students have enrolled yet.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden border">
                    <ReusableTable columns={studentColumns} data={students} />
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-4">
                <Button
                  variant="outline"
                  className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
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

