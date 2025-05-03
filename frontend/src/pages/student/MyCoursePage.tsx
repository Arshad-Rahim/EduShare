"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "./components/Header";
import {
  BookOpen,
  Tag,
  CalendarCheck,
  ArrowLeft,
} from "lucide-react";
import { courseService } from "@/services/courseService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";

interface Course {
  _id: string;
  title: string;
  thumbnail?: string;
  category: string;
  difficulty: string;
  price: number;
  tagline?: string;
}

interface ProgressData {
  courseId: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

export function MyCoursesPage() {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user.userDatas);
  const userId = user?.id || user?._id;
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!userId) {
        console.error("No user ID available", { user });
        toast.error("Please log in to view your courses");
        navigate("/auth");
        return;
      }

      setLoading(true);
      try {
        // Fetch enrolled courses
        const enrolledCourses = await courseService.getEnrolledCourses();
        setCourses(enrolledCourses || []);

        // Fetch progress for each course
        const progressPromises = enrolledCourses.map(async (course: Course) => {
          try {
            const lessonsResponse = await courseService.getLessons(course._id);
            const lessons = lessonsResponse?.data.lessons || [];
            const completedLessons = await courseService.getCompletedLessons(course._id);
            const progress = lessons.length > 0
              ? Math.round((completedLessons.length / lessons.length) * 100)
              : 0;
            return {
              courseId: course._id,
              progress,
              completedLessons: completedLessons.length,
              totalLessons: lessons.length,
            };
          } catch (error) {
            console.error(`Error fetching progress for course ${course._id}:`, error);
            return {
              courseId: course._id,
              progress: 0,
              completedLessons: 0,
              totalLessons: 0,
            };
          }
        });

        const progressResults = await Promise.all(progressPromises);
        setProgressData(progressResults);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        toast.error("Failed to load your courses");
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [userId, navigate]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-emerald-100 text-emerald-800";
      case "Intermediate":
        return "bg-amber-100 text-amber-800";
      case "Advanced":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-700 font-medium">
            Loading your courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col w-full">
      <Header />
      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative w-full bg-gradient-to-br from-primary/5 to-primary/10 py-8 mb-6">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <div className="flex justify-between items-center flex-col sm:flex-row gap-4 sm:gap-0">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
                  My Enrolled Courses
                </h1>
                <p className="text-slate-600 mt-2 max-w-2xl">
                  Explore all the courses you’ve enrolled in and track your progress.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/courses")}
                className="border-slate-300 hover:bg-white hover:border-primary/30 transition-all duration-300 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse All Courses
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full pb-16">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            {courses.length === 0 ? (
              <Card className="border-0 rounded-xl shadow-xl overflow-hidden w-full bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6 w-full p-6 md:p-8 text-center">
                  <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-500 text-lg">
                    You haven’t enrolled in any courses yet.
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
                    Discover our wide range of courses and start learning today!
                  </p>
                  <Button
                    className="mt-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white py-6 shadow-lg transition-all duration-300 text-sm font-semibold"
                    onClick={() => navigate("/courses")}
                  >
                    Explore Courses
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => {
                  const progress = progressData.find((p) => p.courseId === course._id) || {
                    progress: 0,
                    completedLessons: 0,
                    totalLessons: 0,
                  };

                  return (
                    <Card
                      key={course._id}
                      className="border-0 rounded-xl shadow-xl overflow-hidden w-full bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300"
                    >
                      <CardHeader className="p-0">
                        <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
                           
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                            
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                              <BookOpen className="h-14 w-14 text-primary/60" />
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            className={cn(
                              "px-3 py-1.5 text-sm font-medium rounded-md",
                              getDifficultyColor(course.difficulty)
                            )}
                          >
                            {course.difficulty}
                          </Badge>
                          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-1.5 rounded-md">
                            <Tag className="h-3.5 w-3.5 mr-1.5" />
                            {course.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl font-semibold text-slate-800">
                          {course.title}
                        </CardTitle>
                        <p className="text-slate-600 text-sm line-clamp-2">
                          {course.tagline || "Start your learning journey with this course."}
                        </p>
                        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-100 space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-semibold text-slate-700 flex items-center">
                              <CalendarCheck className="h-4 w-4 mr-2 text-primary" />
                              Your Progress
                            </h4>
                            <span className="text-sm font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">
                              {progress.progress}%
                            </span>
                          </div>
                          <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${progress.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <div className="bg-slate-50 px-3 py-2 rounded-md text-slate-700">
                              <span className="font-medium text-primary">
                                {progress.completedLessons}
                              </span>{" "}
                              of {progress.totalLessons} completed
                            </div>
                            <div className="bg-slate-50 px-3 py-2 rounded-md">
                              {progress.totalLessons - progress.completedLessons > 0 ? (
                                <span className="text-slate-700">
                                  {progress.totalLessons - progress.completedLessons} remaining
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-medium">
                                  All complete!
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg text-primary">
                            ₹{course.price}
                          </span>
                          <Button
                            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold transition-all duration-300"
                            onClick={() => navigate(`/courses/${course._id}`)}
                          >
                            View Course
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}