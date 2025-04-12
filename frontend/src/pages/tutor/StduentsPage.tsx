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

export function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
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
                <p className="text-gray-500">No students have enrolled yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={`${student.studentId}-${student.courseId}`}>
                      <TableCell>{student.studentName}</TableCell>
                      <TableCell>{student.studentEmail}</TableCell>
                      <TableCell>{student.courseTitle}</TableCell>
                     
                      <TableCell>₹{student.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
