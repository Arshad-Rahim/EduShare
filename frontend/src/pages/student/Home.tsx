"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Code,
  Database,
  Globe,
  Server,
  Tag,
  Star,
  Laptop,
  Clock,
  Users,
  Award,
  Zap,
  ArrowRight,
  Heart,
  TrendingUp,
  CheckCircle,
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
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { toast } from "sonner";
import { Header } from "./components/Header";
import { wishlistService } from "@/services/wishlistService/wishlistService";
import { courseService } from "@/services/courseService/courseService";

// Category Card Component
const CategoryCard = ({ icon: Icon, title, count }) => (
  <Card className="group  group overflow-hidden transition-all duration-300 hover:shadow-md border-slate-200 hover:border-primary/20 h-full">
    <CardContent className="p-6 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{count} courses</p>
    </CardContent>
  </Card>
);

// Testimonial Card Component
const TestimonialCard = ({ name, role, image, quote, rating }) => (
  <Card className="overflow-hidden transition-all duration-300 hover:shadow-md border-slate-200 h-full">
    <CardContent className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
            }`}
          />
        ))}
      </div>
      <p className="text-slate-600 italic">“{quote}”</p>
    </CardContent>
  </Card>
);

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-all">
    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="h-7 w-7 text-primary" />
    </div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-sm text-slate-600">{description}</p>
  </div>
);

// Main UserHomePage Component
export function UserHomePage() {
  const [courses, setCourses] = useState([]);
  const [wishlist, setWishlist] = useState([]); // State to store wishlisted course IDs
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    fetchWishlistCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getAllCourse("");
      setCourses(response.data.courses.courses || []);
      console.log("Courses in Home", response.data.courses);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const fetchWishlistCourses = async () => {
    try {
      const response = await wishlistService.getWishlist({});
      const wishlistData = response.data.courses || []; // Adjust based on your API response structure
      const wishlistIds = wishlistData.map((course) => course._id);
      setWishlist(wishlistIds);
    } catch (error) {
      console.error("Failed to fetch wishlist courses:", error);
      toast.error("Failed to load wishlist");
    }
  };

  const handleWishlistToggle = async (courseId: string) => {
    const isWishlisted = wishlist.includes(courseId);
    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(courseId)
        setWishlist((prev) => prev.filter((id) => id !== courseId));
        toast.success("Course removed from wishlist");
      } else {
        const response = await wishlistService.addToWishlist(courseId)
        setWishlist((prev) => [...prev, courseId]);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      toast.error(error.response?.data?.message || "Failed to update wishlist");
    }
  };

  const getDifficultyColor = (difficulty) => {
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

  const handleEnroll = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  // Sample data for categories
  const categories = [
    { icon: Code, title: "Web Development", count: 120 },
    { icon: Database, title: "Data Science", count: 85 },
    { icon: Server, title: "Cloud Computing", count: 64 },
    { icon: Globe, title: "Mobile Development", count: 72 },
  ];

  // Sample data for testimonials
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Frontend Developer",
      image: "/placeholder.svg?height=48&width=48&text=SJ",
      quote:
        "The courses on EduShare helped me transition from a beginner to a professional developer in just 6 months.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Data Scientist",
      image: "/placeholder.svg?height=48&width=48&text=MC",
      quote:
        "The data science curriculum is comprehensive and up-to-date with industry standards. Highly recommended!",
      rating: 4,
    },
    {
      name: "Jessica Williams",
      role: "UX Designer",
      image: "/placeholder.svg?height=48&width=48&text=JW",
      quote:
        "I've taken courses on multiple platforms, but EduShare offers the best balance of theory and practical projects.",
      rating: 5,
    },
  ];

  // Sample data for features
  const features = [
    {
      icon: Laptop,
      title: "Learn Anywhere",
      description: "Access courses on any device, anytime, anywhere",
    },
    {
      icon: Award,
      title: "Earn Certificates",
      description:
        "Get recognized for your achievements with shareable certificates",
    },
    {
      icon: Users,
      title: "Expert Instructors",
      description:
        "Learn from industry professionals with real-world experience",
    },
    {
      icon: Clock,
      title: "Self-Paced Learning",
      description: "Study at your own pace with lifetime access to courses",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-br from-slate-50 via-white to-primary/5 py-16 md:py-24 lg:py-32 overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <div className="container px-4 md:px-6 lg:px-8 mx-auto relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col space-y-6">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <Zap className="mr-1 h-3.5 w-3.5" />
                  Over 500+ courses available
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Learn the skills you need to{" "}
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    succeed
                  </span>
                </h1>
                <p className="max-w-[600px] text-slate-600 md:text-xl">
                  Access high-quality courses taught by industry experts. Start
                  your learning journey today and transform your career.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="font-medium shadow-sm" asChild>
                    <Link to="/courses">
                      Browse Courses
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="font-medium"
                    asChild
                  >
                    <Link to="/paths">View Learning Paths</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center">
                    <CheckCircle className="mr-1 h-4 w-4 text-primary" />
                    Expert instructors
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-1 h-4 w-4 text-primary" />
                    Flexible learning
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-1 h-4 w-4 text-primary" />
                    Certificates
                  </div>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                  <video
                    src="../../../public/CN4By7T88Hg2dj5lqo.mp4"
                    className="w-full h-auto"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <h3 className="text-white font-bold text-xl mb-2">
                      Start Learning Today
                    </h3>
                    <p className="text-white/90 text-sm">
                      Join thousands of students worldwide
                    </p>
                  </div>
                </div>
                <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary/5 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 bg-white border-y border-slate-200">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <h3 className="text-4xl font-bold text-primary mb-2">500+</h3>
                <p className="text-slate-600">Courses</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-primary mb-2">50k+</h3>
                <p className="text-slate-600">Students</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-primary mb-2">100+</h3>
                <p className="text-slate-600">Instructors</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-primary mb-2">95%</h3>
                <p className="text-slate-600">Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="w-full py-16 bg-slate-50">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <div className="flex flex-col items-center gap-4 text-center mb-12">
              <Badge variant="outline" className="px-3.5 py-1.5 text-sm">
                Explore by Category
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Find Your Perfect Course
              </h2>
              <p className="max-w-[700px] text-slate-600 md:text-lg">
                Browse through our diverse range of courses categorized by field
                of study
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <CategoryCard key={index} {...category} />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <div className="flex flex-col items-center gap-4 text-center mb-12">
              <Badge variant="outline" className="px-3.5 py-1.5 text-sm">
                Why Choose Us
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Learning Made Simple
              </h2>
              <p className="max-w-[700px] text-slate-600 md:text-lg">
                Our platform is designed to provide you with the best learning
                experience
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* All Courses Section */}
        <section className="w-full py-16 bg-slate-50">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <div className="flex flex-col items-center gap-4 text-center mb-12">
              <Badge variant="outline" className="px-3.5 py-1.5 text-sm">
                Latest Courses
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Expand Your Knowledge
              </h2>
              <p className="max-w-[700px] text-slate-600 md:text-lg">
                Explore our full catalog of courses designed to help you succeed
                in today's digital world
              </p>
            </div>
            <div className="mt-12">
              {courses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 max-w-3xl mx-auto">
                  <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-slate-700 mb-3">
                    No courses available yet
                  </h3>
                  <p className="text-slate-500 max-w-md mx-auto mb-6">
                    We're constantly adding new courses to our platform. Check
                    back soon for exciting learning opportunities!
                  </p>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/courses">Browse All Categories</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {courses.map((course) => {
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
                            <Badge
                              className={getDifficultyColor(course.difficulty)}
                            >
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
                            }`}
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
                                  ₹{course.price}
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
                  })}
                </div>
              )}
              {courses.length > 0 && (
                <div className="flex justify-center mt-12">
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/courses">
                      View All Courses
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <div className="flex flex-col items-center gap-4 text-center mb-12">
              <Badge variant="outline" className="px-3.5 py-1.5 text-sm">
                Student Success Stories
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                What Our Students Say
              </h2>
              <p className="max-w-[700px] text-slate-600 md:text-lg">
                Hear from our students who have transformed their careers
                through our platform
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} />
              ))}
            </div>
          </div>
        </section>

        {/* Trending Courses Section */}
        <section className="w-full py-16 bg-slate-50">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
              <div>
                <Badge variant="outline" className="px-3.5 py-1.5 text-sm mb-4">
                  <TrendingUp className="mr-1 h-3.5 w-3.5" />
                  Trending Now
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Most Popular Courses
                </h2>
                <p className="max-w-[500px] text-slate-600 mt-2">
                  Join thousands of students already learning these in-demand
                  skills
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/courses">
                  View All Trending
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            {courses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.slice(0, 3).map((course) => {
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
                          <Badge
                            className={getDifficultyColor(course.difficulty)}
                          >
                            {course.difficulty}
                          </Badge>
                        </div>
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-primary/90 text-white">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            Popular
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
                          }`}
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
                                ₹{course.price}
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
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full bg-primary text-primary-foreground py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_80%)]"></div>
          <div className="container px-4 md:px-6 lg:px-8 mx-auto relative">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
                Ready to Start Your Learning Journey?
              </h2>
              <p className="max-w-[700px] mx-auto md:text-xl mb-8">
                Join thousands of students already learning on EduShare and
                transform your career today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="font-medium"
                  asChild
                >
                  <Link to="/auth">
                    Sign Up for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link to="/courses">Explore Courses</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-white">
        <div className="container px-4 md:px-6 lg:px-8 mx-auto py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  EduShare
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-600 max-w-xs">
                Empowering learners worldwide with high-quality tech education.
                Our mission is to make education accessible to everyone.
              </p>
              <div className="mt-6 flex space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect
                      width="20"
                      height="20"
                      x="2"
                      y="2"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect width="4" height="12" x="2" y="9"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Courses</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/courses"
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    Web Development
                  </Link>
                </li>
                <li>
                  <Link
                    to="/courses"
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    Data Science
                  </Link>
                </li>
                <li>
                  <Link
                    to="/courses"
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    Cloud Computing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/courses"
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    Mobile Development
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/about"
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="#"
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 border-t pt-8">
            <p className="text-sm text-slate-600">
              © 2025 EduShare. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="#"
                className="text-sm text-slate-600 hover:text-primary"
              >
                Help Center
              </Link>
              <Link
                to="#"
                className="text-sm text-slate-600 hover:text-primary"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
