// src/pages/tutor/StudentsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { toast } from "sonner";
import { ArrowLeft, Users } from "lucide-react";
import { Header } from "./components/Header";
import { SideBar } from "./components/SideBar";

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

export type TStudent = {
  _id: string;
  name: string;
  email: string;
  role: string;
  course: string;
  purchaseDate: Date;
  amount: number;
};

export function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<TStudent[] | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch students data
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await authAxiosInstance.get("/tutors/students");
      setStudents(response.data.students || []);
      setTotalRevenue(response.data.totalRevenue || 0);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Failed to load students data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Define table columns
  const columns: Column<TStudent>[] = [
    { header: "Student Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Course", accessor: "course" },
    { header: "Purchase Date", accessor: "purchaseDate" },
    {
      header: "Amount",
      accessor: (student) => `₹${student.amount}`,
    },
  ];

  if (!students || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col w-full">
      <Header />
      <div className="flex flex-col md:flex-row gap-6 p-6 w-full">
        <div className="w-full md:w-64 flex-shrink-0">
          <SideBar sidebarOpen={true} />
        </div>
        <div className="container mx-auto">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => navigate("/tutor/home")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Main Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Your Students
                </CardTitle>
                <div className="text-sm text-gray-600">
                  Total Revenue: ₹{totalRevenue}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No students have enrolled yet.
                  </p>
                </div>
              ) : (
                <ReusableTable columns={columns} data={students} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
