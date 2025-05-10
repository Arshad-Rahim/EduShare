

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Trash2,
  Heart,
  Clock,
  Users,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Header } from "./components/Header";
import { wishlistService } from "@/services/wishlistService";

// Define Course interface
interface Course {
  _id: string;
  title: string;
  thumbnail?: string;
  tagline: string;
  difficulty: string;
  students?: number;
  price: string | number;
  about: string;
  duration?: string;
}

export default function WishlistPage() {
  const [wishlistCourses, setWishlistCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const coursesPerPage = 12;
  const navigate = useNavigate();

  // Fetch wishlist courses from API
  const fetchWishlistCourses = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: coursesPerPage,
      };

      const response = await wishlistService.getWishlist(params);
      const wishlistData = response?.data.courses || [];
      const totalCourses = response?.data.total || 1;

      setWishlistCourses(wishlistData);
      setTotalPages(Math.ceil(totalCourses / coursesPerPage));
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch wishlist courses:", error);
      setLoading(false);
    }
  };

  // Remove course from wishlist
  const handleRemoveFromWishlist = async (courseId: string) => {
    try {
      await wishlistService.removeFromWishlist(courseId);
      setWishlistCourses((prev) =>
        prev.filter((course) => course._id !== courseId)
      );
      toast.success("Course removed from wishlist");
    } catch (error) {
      console.error("Failed to remove course from wishlist:", error);
    }
  };

  // Fetch wishlist on mount and page change
  useEffect(() => {
    fetchWishlistCourses();
  }, [currentPage]);

  const handleEnroll = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const Pagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center mt-8">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-1">
            {pageNumbers.map((number) => (
              <Button
                key={number}
                variant={currentPage === number ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(number)}
                className={
                  currentPage === number
                    ? "duration-300 bg-primary text-white"
                    : ""
                }
              >
                {number}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full bg-gradient-to-r from-slate-50 to-slate-100 py-12 border-b">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                My Wishlist
              </h1>
              <p className="mt-4 max-w-[700px] text-slate-600 md:text-lg">
                View and manage your saved courses
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-12">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {wishlistCourses.length}
                  </span>{" "}
                  courses in your wishlist
                </p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-9 w-9 rounded-none ${
                        viewMode === "grid" ? "bg-muted" : ""
                      }`}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                      <span className="sr-only">Grid view</span>
                    </Button>
                    <Separator orientation="vertical" className="h-9" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-9 w-9 rounded-none ${
                        viewMode === "list" ? "bg-muted" : ""
                      }`}
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                      <span className="sr-only">List view</span>
                    </Button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden h-full animate-pulse"
                    >
                      <div className="aspect-video w-full bg-slate-200" />
                      <CardHeader className="pb-2">
                        <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="h-4 bg-slate-200 rounded" />
                            <div className="h-4 bg-slate-200 rounded" />
                          </div>
                          <div className="h-px bg-slate-200" />
                          <div className="space-y-2">
                            <div className="h-3 bg-slate-200 rounded w-full" />
                            <div className="h-3 bg-slate-200 rounded w-5/6" />
                            <div className="h-3 bg-slate-200 rounded w-4/6" />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <div className="h-9 bg-slate-200 rounded w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : wishlistCourses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
                  <Heart className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-slate-700 mb-3">
                    Your Wishlist is Empty
                  </h3>
                  <p className="text-slate-500 max-w-md mx-auto mb-6">
                    You haven't added any courses to your wishlist yet. Explore
                    our courses to find something you love!
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/courses")}
                  >
                    Browse Courses
                  </Button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistCourses.map((course) => (
                    <Card
                      key={course._id}
                      className="overflow-hidden transition-all duration-300 hover:shadow-lg border border-slate-200 h-full flex flex-col group"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail || "/placeholder.svg"}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200">
                            <BookOpen className="h-12 w-12 text-slate-400" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <Badge
                            className={getDifficultyColor(course.difficulty)}
                          >
                            {course.difficulty}
                          </Badge>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-3 left-3 h-8 w-8 rounded-full bg-white/80 text-red-500 hover:bg-white hover:text-red-700"
                          onClick={() => handleRemoveFromWishlist(course._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove from wishlist</span>
                        </Button>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {course.tagline}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2 flex-grow">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Users className="h-4 w-4" />
                              <span>{course.students || "N/A"} students</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <span className="font-medium">
                                ₹{parseFloat(String(course.price)) || 0}
                              </span>
                            </div>
                          </div>
                          <Separator />
                          <p className="text-sm text-slate-600 line-clamp-3">
                            {course.about}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => handleEnroll(course._id)}
                        >
                          Enroll Now
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlistCourses.map((course) => (
                    <Card
                      key={course._id}
                      className="overflow-hidden transition-all duration-300 hover:shadow-md border border-slate-200 group"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="relative md:w-1/3 lg:w-1/4 overflow-hidden bg-slate-100">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail || "/placeholder.svg"}
                              alt={course.title}
                              className="w-full h-full object-cover aspect-video md:aspect-auto transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full aspect-video md:aspect-auto flex items-center justify-center bg-slate-200">
                              <BookOpen className="h-12 w-12 text-slate-400" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <Badge
                              className={getDifficultyColor(course.difficulty)}
                            >
                              {course.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex flex-col h-full justify-between">
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                  {course.title}
                                </h3>
                                <div className="flex items-center ml-4">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < 4
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-slate-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm ml-2">4.0</span>
                                </div>
                              </div>
                              <p className="text-slate-600 mb-4">
                                {course.tagline}
                              </p>
                              <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                                {course.about}
                              </p>
                              <div className="flex flex-wrap gap-3 mb-4">
                                <div className="flex items-center text-sm text-slate-600">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {course.duration || "N/A"}
                                </div>
                                <div className="flex items-center text-sm text-slate-600">
                                  <Users className="h-4 w-4 mr-1" />
                                  {course.students || "N/A"} students
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <div className="text-xl font-bold">
                                ₹{parseFloat(String(course.price)) || 0}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hidden sm:flex"
                                  onClick={() =>
                                    handleRemoveFromWishlist(course._id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleEnroll(course._id)}
                                >
                                  Enroll Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {wishlistCourses.length > 0 && <Pagination />}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}