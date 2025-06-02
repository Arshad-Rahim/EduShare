import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import {
  BookOpen,
  Search,
  Filter,
  Tag,
  Star,
  X,
  Heart,
  Clock,
  Users,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookOpenCheck,
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Header } from "./components/Header";
import { wishlistService } from "@/services/wishlistService";
import { courseService } from "@/services/courseService";
import { useSelector } from "react-redux";

// Define interfaces
interface Course {
  _id: string;
  title: string;
  thumbnail?: string;
  tagline: string;
  difficulty: string;
  category: string;
  price: string | number;
  about: string;
  duration?: string;
  students?: string;
}

interface CourseParams {
  search?: string;
  category?: string;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: string;
  limit?: string;
}

export function CourseListingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState("popular");
  const [priceRange, setPriceRange] = useState<number[]>([0, 1500]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    []
  );
  const [debouncedValue] = useDebounce(searchQuery, 500);

  // Get current user from Redux store
  const currentUser = useSelector((state: any) => state.user.userDatas);

  // Check if user is authenticated
  const isAuthenticated = useMemo(() => !!currentUser, [currentUser]);

  // Memoized static data
  const categories = useMemo(
    () => [
      { id: "web-dev", name: "Web Development" },
      { id: "mobile-dev", name: "Mobile Development" },
      { id: "data-science", name: "Data Science" },
      { id: "programming", name: "Programming" },
      { id: "cloud", name: "Cloud Computing" },
      { id: "design", name: "UI/UX Design" },
      { id: "devops", name: "DevOps" },
      { id: "ai-ml", name: "AI & Machine Learning" },
      { id: "cybersecurity", name: "Cybersecurity" },
      { id: "other", name: "Other" },
    ],
    []
  );

  const difficulties = useMemo(
    () => [
      { id: "beginner", name: "Beginner" },
      { id: "intermediate", name: "Intermediate" },
      { id: "advanced", name: "Advanced" },
    ],
    []
  );

  const coursesPerPage = useMemo(() => 12, []);

  // Fetch courses from backend with filters
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params: CourseParams = {
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategories.length > 0 && {
          category: selectedCategories.join(","),
        }),
        ...(selectedDifficulties.length > 0 && {
          difficulty: selectedDifficulties.join(","),
        }),
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        ...(sortOption && { sort: sortOption }),
        page: currentPage.toString(),
        limit: coursesPerPage.toString(),
      };

      const response = await courseService.getAllCourse(params);
      const coursesData = response.data.courses.courses || [];
      const totalCourses = response.data.courses.total || 0;

      setCourses(coursesData);
      setTotalPages(Math.ceil(totalCourses / coursesPerPage));
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    selectedCategories,
    selectedDifficulties,
    priceRange,
    sortOption,
    currentPage,
    coursesPerPage,
  ]);

  // Fetch wishlist courses from backend
  const fetchWishlistCourses = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      const response = await wishlistService.getWishlist({
        page: 1,
        limit: 100,
      });
      if (response) {
        const wishlistData = response.data.courses || [];
        const wishlistIds = wishlistData.map((course: Course) => course._id);
        setWishlist(wishlistIds);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist courses:", error);
      toast.error("Failed to load wishlist");
    }
  }, [isAuthenticated]);

  // Handle wishlist toggle (add/remove)
  const handleWishlistToggle = useCallback(
    async (courseId: string) => {
      if (!isAuthenticated) {
        toast.info("Please sign up or sign in to add courses to your wishlist");
        navigate("/auth");
        return;
      }
      const isWishlisted = wishlist.includes(courseId);
      try {
        if (isWishlisted) {
          await wishlistService.removeFromWishlist(courseId);
          setWishlist((prev) => prev.filter((id) => id !== courseId));
          toast.success("Course removed from wishlist");
        } else {
          const response = await wishlistService.addToWishlist(courseId);
          setWishlist((prev) => [...prev, courseId]);
          toast.success(response?.data.message || "Course added to wishlist");
        }
      } catch (error) {
        console.error("Failed to toggle wishlist:", error);
        toast.error("Failed to update wishlist");
      }
    },
    [wishlist, isAuthenticated, navigate]
  );

  // Initial fetch and category from URL
  useEffect(() => {
    const initializeData = async () => {
      const categoryParam = searchParams.get("category");
      if (categoryParam && !selectedCategories.includes(categoryParam)) {
        setSelectedCategories([categoryParam]);
      }
      await fetchWishlistCourses();
    };
    initializeData();
  }, [searchParams, fetchWishlistCourses]);

  // Fetch courses whenever filters, sort, or page changes
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses, debouncedValue]);

  // Event handlers
  const handleCategoryToggle = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  }, []);

  const handleDifficultyToggle = useCallback((difficulty: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty]
    );
    setCurrentPage(1);
  }, []);

  const handlePriceRangeChange = useCallback((value: number[]) => {
    setPriceRange(value);
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    console.log("Clearing Filters");
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedDifficulties([]);
    setPriceRange([0, 1500]);
    setSortOption("popular");
    setCurrentPage(1);
  }, []);

  const handleEnroll = useCallback(
    (courseId: string) => {
      navigate(`/courses/${courseId}`);
    },
    [navigate]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const getDifficultyColor = useCallback((difficulty: string) => {
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
  }, []);

  // Memoized Pagination component
  const Pagination = useMemo(
    () => (
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
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
              )
            )}
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
    ),
    [currentPage, totalPages, handlePageChange]
  );

  // Memoized MobileFilters component
  const MobileFilters = useMemo(
    () => (
      <div
        className={`fixed inset-0 bg-background z-50 transform ${
          mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileFiltersOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Price Range</h3>
              <div className="space-y-4">
                <Slider
                  defaultValue={priceRange}
                  min={0}
                  max={1500}
                  step={10}
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  className="mb-6"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    ₹{priceRange[0]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ₹{priceRange[1]}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`category-${category.id}-mobile`}
                      checked={selectedCategories.includes(category.name)}
                      onCheckedChange={() =>
                        handleCategoryToggle(category.name)
                      }
                    />
                    <Label
                      htmlFor={`category-${category.id}-mobile`}
                      className="text-sm cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-3">Difficulty Level</h3>
              <div className="space-y-2">
                {difficulties.map((difficulty) => (
                  <div
                    key={difficulty.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`difficulty-${difficulty.id}-mobile`}
                      checked={selectedDifficulties.includes(difficulty.name)}
                      onCheckedChange={() =>
                        handleDifficultyToggle(difficulty.name)
                      }
                    />
                    <Label
                      htmlFor={`difficulty-${difficulty.id}-mobile`}
                      className="text-sm cursor-pointer"
                    >
                      {difficulty.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="text-sm"
              >
                Clear All
              </Button>
              <Button onClick={() => setMobileFiltersOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    ),
    [
      mobileFiltersOpen,
      priceRange,
      selectedCategories,
      selectedDifficulties,
      categories,
      difficulties,
      handlePriceRangeChange,
      handleCategoryToggle,
      handleDifficultyToggle,
      handleClearFilters,
      setMobileFiltersOpen,
    ]
  );

  // Memoized course list rendering
  const courseList = useMemo(
    () =>
      viewMode === "grid"
        ? courses.map((course) => {
            const isWishlisted = wishlist.includes(course._id);
            return (
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
                    <Badge className={getDifficultyColor(course.difficulty)}>
                      {course.difficulty}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleWishlistToggle(course._id)}
                    size="icon"
                    variant="ghost"
                    className={`absolute top-3 left-3 h-8 w-8 rounded-full bg-white/80 ${
                      isWishlisted
                        ? "text-red-500 hover:text-red-700"
                        : "text-slate-700 hover:text-primary"
                    } ${
                      !isAuthenticated ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!isAuthenticated}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isWishlisted ? "fill-red-500" : ""
                      }`}
                    />
                    <span className="sr-only">
                      {isWishlisted
                        ? "Remove from wishlist"
                        : "Add to wishlist"}
                    </span>
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
                        <Tag className="h-4 w-4" />
                        <span>{course.category}</span>
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
            );
          })
        : courses.map((course) => {
            const isWishlisted = wishlist.includes(course._id);
            return (
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
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => handleWishlistToggle(course._id)}
                      size="icon"
                      variant="ghost"
                      className={`absolute top-3 left-3 h-8 w-8 rounded-full bg-white/80 ${
                        isWishlisted
                          ? "text-red-500 hover:text-red-700"
                          : "text-slate-700 hover:text-primary"
                      } ${
                        !isAuthenticated ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={!isAuthenticated}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isWishlisted ? "fill-red-500" : ""
                        }`}
                      />
                      <span className="sr-only">
                        {isWishlisted
                          ? "Remove from wishlist"
                          : "Add to wishlist"}
                      </span>
                    </Button>
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
                        <p className="text-slate-600 mb-4">{course.tagline}</p>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                          {course.about}
                        </p>
                        <div className="flex flex-wrap gap-3 mb-4">
                          <div className="flex items-center text-sm text-slate-600">
                            <Tag className="h-4 w-4 mr-1" />
                            {course.category}
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {course.duration || "10 hours"}
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <Users className="h-4 w-4 mr-1" />
                            {course.students || "1,234"} students
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
                            onClick={() => handleWishlistToggle(course._id)}
                            disabled={!isAuthenticated}
                          >
                            <Bookmark className="h-4 w-4 mr-2" />
                            {isWishlisted ? "Remove" : "Save"}
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
            );
          }),
    [
      courses,
      wishlist,
      handleWishlistToggle,
      handleEnroll,
      getDifficultyColor,
      viewMode,
      isAuthenticated,
    ]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {MobileFilters}
      <main className="flex-1">
        <section className="w-full bg-gradient-to-r from-slate-50 to-slate-100 py-12 border-b">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Explore Our Courses
              </h1>
              <p className="mt-4 max-w-[700px] text-slate-600 md:text-lg">
                Discover a wide range of courses designed to help you master new
                skills and advance your career
              </p>
              <div className="w-full max-w-3xl mt-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search for courses, topics, or skills..."
                    className="w-full pl-10 py-6 text-base rounded-full border-slate-200 bg-white shadow-sm focus-visible:ring-primary"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="hidden md:block w-full md:w-64 lg:w-72 shrink-0 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-8 text-xs text-muted-foreground"
                  >
                    Clear All
                  </Button>
                </div>

                <Accordion
                  type="multiple"
                  defaultValue={["price", "categories", "difficulty"]}
                  className="w-full"
                >
                  <AccordionItem value="price" className="border-b">
                    <AccordionTrigger className="text-base py-3">
                      Price Range
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <Slider
                          defaultValue={priceRange}
                          min={0}
                          max={1500}
                          step={10}
                          value={priceRange}
                          onValueChange={handlePriceRangeChange}
                          className="mb-6"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            ₹{priceRange[0]}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ₹{priceRange[1]}
                          </span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="categories" className="border-b">
                    <AccordionTrigger className="text-base py-3">
                      Categories
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={selectedCategories.includes(
                                category.name
                              )}
                              onCheckedChange={() =>
                                handleCategoryToggle(category.name)
                              }
                            />
                            <Label
                              htmlFor={`category-${category.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="difficulty" className="border-b">
                    <AccordionTrigger className="text-base py-3">
                      Difficulty Level
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {difficulties.map((difficulty) => (
                          <div
                            key={difficulty.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`difficulty-${difficulty.id}`}
                              checked={selectedDifficulties.includes(
                                difficulty.name
                              )}
                              onCheckedChange={() =>
                                handleDifficultyToggle(difficulty.name)
                              }
                            />
                            <Label
                              htmlFor={`difficulty-${difficulty.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {difficulty.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="md:hidden mr-2"
                      onClick={() => setMobileFiltersOpen(true)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Showing{" "}
                      <span className="font-medium text-foreground">
                        {courses.length}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select
                      value={sortOption}
                      onValueChange={(value) => {
                        setSortOption(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="price-low">
                          Price: Low to High
                        </SelectItem>
                        <SelectItem value="price-high">
                          Price: High to Low
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="hidden sm:flex border rounded-md">
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
                ) : courses.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
                    <BookOpenCheck className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-xl font-medium text-slate-700 mb-3">
                      No courses found
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                      We couldn't find any courses matching your criteria. Try
                      adjusting your filters or search query.
                    </p>
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "space-y-4"
                    }
                  >
                    {courseList}
                  </div>
                )}

                {courses.length > 0 && Pagination}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default React.memo(CourseListingPage);
