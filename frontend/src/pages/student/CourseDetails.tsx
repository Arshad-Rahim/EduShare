import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Header } from "./components/Header";
import {
  BookOpen,
  Tag,
  Video,
  ArrowLeft,
  Clock,
  Star,
  Lock,
  CheckCircle,
  PlayCircle,
  Calendar,
  CalendarCheck,
  MessageCircle,
  Heart,
} from "lucide-react";
import { courseService } from "@/services/courseService";
import { wishlistService } from "@/services/wishlistService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { VideoCall } from "@/components/videoCall/VideoCall";

export function CourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentLessonIdRef = useRef<string | null>(null);
  const currentUser = useSelector((state: any) => state.user.userDatas);

  // Memoized studentId
  const studentId = useMemo(
    () => currentUser?.id || currentUser?._id,
    [currentUser]
  );

  // Check if user is authenticated
  const isAuthenticated = useMemo(() => !!currentUser, [currentUser]);

  // Fetch courses data and wishlist
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (courseId) {
        // Fetch courses details (publicly accessible)
        const courseData = await courseService.getCourseDetails(courseId);
        setCourse(courseData);

        // Fetching lessons (publicly accessible)
        const response = await courseService.getLessons(courseId);
        if (response) {
          setLessons(response.data?.lessons || []);
        }

        // Fetch user-specific data only if authenticated
        if (isAuthenticated) {
          try {
            const purchaseStatus = await courseService.checkCoursePurchase(
              courseId
            );
            setIsPurchased(purchaseStatus || false);
          } catch (error) {
            console.error("Error checking purchase status:", error);
            setIsPurchased(false);
          }

          try {
            const completed = await courseService.getCompletedLessons(courseId);
            setCompletedLessons(completed?.completedLessons || []);
          } catch (error) {
            console.error("Error fetching completed lessons:", error);
            setCompletedLessons([]);
          }

          // Fetch wishlist
          try {
            const wishlistResponse = await wishlistService.getWishlist({
              page: 1,
              limit: 100,
            });
            if (wishlistResponse) {
              const wishlistData = wishlistResponse.data?.courses || [];
              const wishlistIds = wishlistData.map((course: any) => course._id);
              setWishlist(wishlistIds);
            }
          } catch (error) {
            console.error("Failed to fetch wishlist:", error);
            toast.error("Failed to load wishlist");
          }
        } else {
          // For unauthenticated users, default to guest state
          setIsPurchased(false);
          setCompletedLessons([]);
          setWishlist([]);
        }
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      toast.error("Failed to load course details");
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate, isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle wishlist toggle
  const handleWishlistToggle = useCallback(
    async (courseId: string) => {
      if (!isAuthenticated) {
        toast.info("Please sign in to add courses to your wishlist");
        navigate("/auth/login");
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
          toast.success(response?.data?.message || "Course added to wishlist");
        }
      } catch (error) {
        console.error("Failed to toggle wishlist:", error);
        toast.error("Failed to update wishlist");
      }
    },
    [wishlist, isAuthenticated, navigate]
  );

  // Event handlers and utilities
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

  const handlePlayVideo = useCallback(
    (lesson: any, index: number) => {
      const videoUrl = lesson.file || lesson.videoUrl;
      if (videoUrl) {
        if (isPurchased || index === 0) {
          setSelectedVideo(videoUrl);
          setCurrentLesson(lesson);
          setVideoModalOpen(true);
          currentLessonIdRef.current = lesson._id;
        } else {
          toast.info("Please enroll to access this lesson");
          navigate(`/courses/${courseId}/enroll`);
        }
      } else {
        toast.error("No video available for this lesson");
      }
    },
    [isPurchased, courseId, navigate]
  );

  const handleVideoEnded = useCallback(async () => {
    if (
      currentLessonIdRef.current &&
      !completedLessons.includes(currentLessonIdRef.current) &&
      isAuthenticated
    ) {
      try {
        if (courseId) {
          await courseService.markLessonCompleted(
            currentLessonIdRef.current,
            courseId
          );
          setCompletedLessons((prev) => [...prev, currentLessonIdRef.current!]);
          toast.success("Lesson marked as completed!");
        }
      } catch (error) {
        console.error("Error marking lesson as completed:", error);
        toast.error("Failed to mark lesson as completed");
      }
    }
  }, [completedLessons, courseId, isAuthenticated]);

  const handleEnroll = useCallback(() => {
    navigate(`/courses/${courseId}/enroll`);
  }, [courseId, navigate]);

  const calculateProgress = useCallback(() => {
    if (lessons.length === 0) return 0;
    return Math.round((completedLessons.length / lessons.length) * 100);
  }, [lessons, completedLessons]);

  const isLessonCompleted = useCallback(
    (lessonId: string) => {
      return completedLessons.includes(lessonId);
    },
    [completedLessons]
  );

  const handleStartCall = useCallback(() => {
    if (!isAuthenticated) {
      toast.info("Please sign in to call the tutor");
      navigate("/auth/login");
      return;
    }
    if (!isPurchased) {
      toast.info("Please enroll in the course to call the tutor");
      navigate(`/courses/${courseId}/enroll`);
      return;
    }
    if (!course || !course._id || !studentId || !course.tutorId) {
      toast.error("Course or user data not loaded. Please try again.");
      console.error("handleStartCall: Missing data", {
        course,
        studentId,
        tutorId: course?.tutorId,
      });
      return;
    }
    setIsInCall(true);
  }, [isPurchased, courseId, navigate, course, studentId, isAuthenticated]);

  const handleEndCall = useCallback(() => {
    setIsInCall(false);
  }, []);

  const handleMessageTutor = useCallback(() => {
    if (!isAuthenticated) {
      toast.info("Please sign in to message the tutor");
      navigate("/auth/login");
      return;
    }
    if (!isPurchased) {
      toast.info("Please enroll in the course to message the tutor");
      navigate(`/courses/${courseId}/enroll`);
      return;
    }
    if (!courseId || !studentId || !course?.tutorId) {
      toast.error("Course or user data not loaded. Please try again.");
      console.error("handleMessageTutor: Missing data", {
        courseId,
        course,
        studentId,
        tutorId: course?.tutorId,
      });
      return;
    }
    try {
      console.log("Navigating to private chat with state:", {
        studentId,
        tutorId: course.tutorId,
        courseId,
        courseTitle: course?.title || "Unknown Course",
      });
      navigate(`/courses/${courseId}/chat`, {
        state: {
          studentId,
          tutorId: course.tutorId,
          courseId,
          courseTitle: course?.title || "Unknown Course",
        },
      });
    } catch (error) {
      console.error("Navigation to chat failed:", error);
      toast.error("Failed to open chat. Please try again.");
    }
  }, [isPurchased, courseId, navigate, course, studentId, isAuthenticated]);

  // Memoized lesson list rendering
  const lessonList = useMemo(
    () =>
      lessons.map((lesson, index) => {
        const isCompleted = isLessonCompleted(lesson._id);
        const isLocked = !isPurchased && index !== 0;

        return (
          <div
            key={lesson._id}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg border transition-all duration-300",
              isCompleted
                ? "bg-gradient-to-r from-emerald-50 to-emerald-50/50 border-emerald-100 shadow-sm"
                : isLocked
                ? "bg-slate-50 border-slate-200 opacity-80"
                : "bg-white border-slate-200 hover:border-primary/30 hover:bg-primary/5 shadow-sm hover:shadow-md"
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex items-center justify-center h-12 w-12 rounded-full shrink-0",
                  isCompleted
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-primary"
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <span className="text-base font-semibold">{index + 1}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "font-medium text-base",
                      isCompleted ? "text-emerald-600" : "text-gray-600"
                    )}
                  >
                    {lesson.title}
                  </p>
                  {isLocked && (
                    <div className="bg-gray-100 text-gray-600 rounded-md text-xs flex items-center">
                      <Lock className="h-3 w-3 mr-1" /> Premium
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5">
                  <span className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {lesson.duration ? `${lesson.duration} min` : "No duration"}
                  </span>
                  {isCompleted && (
                    <span className="text-emerald-600 flex items-center bg-emerald-100 px-2 py-0.5 rounded-md">
                      <CheckCircle className="h-3 w-4 mr-1" />
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant={isLocked ? "ghost" : "outline"}
              size="sm"
              onClick={() => handlePlayVideo(lesson, index)}
              className={cn(
                "transition-all duration-200 hover:scale-105",
                isCompleted
                  ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  : isLocked
                  ? "text-gray-400"
                  : "hover:bg-blue-100 hover:text-blue-600 hover:border-blue-600"
              )}
            >
              {isLocked ? (
                <Lock className="h-4 w-4 mr-1.5" />
              ) : (
                <PlayCircle
                  className={cn(
                    "h-4 w-4 mr-1.5",
                    isCompleted ? "text-emerald-600" : "text-blue-600"
                  )}
                />
              )}
              {isLocked ? "Locked" : "Play Lesson"}
            </Button>
          </div>
        );
      }),
    [lessons, isPurchased, isLessonCompleted, handlePlayVideo]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">
            Loading your course experience...
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col w-full">
      <Header />
      <main className="flex-1 w-full">
        <section className="relative w-full bg-gradient-to-br from-blue-50 to-blue-100 py-8 mb-6">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <div className="flex justify-between items-center flex-col sm:flex-row gap-4 sm:gap-0">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
                  {course.title}
                </h1>
                <p className="text-gray-600 mt-2 max-w-2xl">{course.tagline}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/courses")}
                className="border-gray-300 hover:bg-white hover:border-blue-600 transition-all duration-200 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full pb-16">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <Card className="border-0 rounded-xl shadow-full bg-white/80 backdrop-blur-md">
              <CardContent className="pt-6 w-full p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 relative">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail || "/placeholder.svg"}
                          alt={course.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <BookOpen className="h-14 w-14 text-blue-600/60" />
                        </div>
                      )}
                      {courseId && (
                        <Button
                          onClick={() => handleWishlistToggle(courseId)}
                          size="icon"
                          variant="ghost"
                          className={cn(
                            "absolute top-3 left-3 h-8 w-8 rounded-full bg-white/80",
                            wishlist.includes(courseId)
                              ? "text-red-600 hover:text-red-700"
                              : "text-gray Comments-774 Removed: -600 hover:text-gray-700",
                            !isAuthenticated && "opacity-50 cursor-not-allowed"
                          )}
                          disabled={!isAuthenticated}
                        >
                          <Heart
                            className={cn(
                              "h-4 w-4",
                              wishlist.includes(courseId) && "fill-red-600"
                            )}
                          />
                          <span className="sr-only">
                            {wishlist.includes(courseId)
                              ? "Remove from wishlist"
                              : "Add to wishlist"}
                          </span>
                        </Button>
                      )}
                    </div>

                    <div className="mt-6 space-y-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-md",
                            getDifficultyColor(course.difficulty)
                          )}
                        >
                          {course.difficulty}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-3 py-1.5 rounded-md">
                          <Tag className="h-3.5 w-3.5 mr-1.5" />
                          {course.category}
                        </Badge>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100">
                              <Star className="h-5 w-5 text-blue-600 fill-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "h-4 w-4",
                                      i < 4
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-600 mt-0.5">
                                4.0
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-xl text-blue-600">
                            ₹{course.price || 0}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200">
                            <Video className="h-5 w-5 text-blue-600/80" />
                            <div>
                              <p className="text-xs text-gray-500">Lessons</p>
                              <p className="font-semibold">{lessons.length}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isAuthenticated && isPurchased && (
                        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 space-y-4 hover:shadow-lg transition-all duration-200">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                              <CalendarCheck className="h-4 w-4 mr-2 text-blue-600" />
                              Your Progress
                            </h4>
                            <span className="text-sm font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded-md">
                              {calculateProgress()}%
                            </span>
                          </div>
                          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-200 ease-out"
                              style={{ width: `${calculateProgress()}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-700">
                              <span className="font-medium text-blue-600">
                                {completedLessons.length}
                              </span>{" "}
                              of {lessons.length} completed
                            </div>
                            <div className="bg-gray-50 px-3 py-2 rounded-md">
                              {lessons.length - completedLessons.length > 0 ? (
                                <span className="text-gray-700">
                                  {lessons.length - completedLessons.length}{" "}
                                  remaining
                                </span>
                              ) : (
                                <span className="text-green-600 font-medium">
                                  All complete!
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <Button
                        className={cn(
                          "w-full mt-6 text-white py-6 shadow-lg transition-all duration-200 text-sm font-semibold rounded-full",
                          isPurchased
                            ? "bg-green-600 hover:bg-green-600"
                            : "bg-blue-600 hover:bg-blue-700"
                        )}
                        onClick={handleEnroll}
                        disabled={isAuthenticated && isPurchased}
                      >
                        {isPurchased ? (
                          <span className="flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Already Enrolled
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <Calendar className="h-5 w-5 mr-2" />
                            Enroll Now
                          </span>
                        )}
                      </Button>

                      {isAuthenticated && isPurchased && (
                        <div className="flex gap-4 mt-4">
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 shadow-md rounded-lg transition-all duration-200 text-sm font-semibold"
                            onClick={handleStartCall}
                            disabled={isInCall}
                          >
                            <Video className="h-5 w-5 mr-2" />
                            Call Tutor
                          </Button>
                          <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 shadow-md rounded-lg transition-all duration-200 text-sm font-semibold"
                            onClick={handleMessageTutor}
                          >
                            <MessageCircle className="h-5 w-5 mr-2" />
                            Message Tutor
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                        About This Course
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {course.description ||
                          course.about ||
                          "No description available."}
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                        Course Lessons
                      </h3>
                      {lessons.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">
                            No lessons available yet for this course.
                          </p>
                          <p className="text-gray-400 text-sm mt-2">
                            Check back soon for updates!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
                          {lessonList}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {videoModalOpen && selectedVideo && (
              <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
                <DialogContent className="sm:max-w-[900px] w-full max-h-[90vh] bg-white p-0">
                  <DialogHeader className="p-4 border-b">
                    <DialogTitle className="text-lg font-semibold flex items-center">
                      <PlayCircle className="h-5 w-5 mr-2 text-blue-600" />
                      {currentLesson?.title || "Lesson Preview"}
                    </DialogTitle>
                    {currentLesson && (
                      <DialogDescription className="text-sm text-gray-500">
                        {isLessonCompleted(currentLesson._id) ? (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            You’ve completed this lesson
                          </span>
                        ) : (
                          <span>Watch the full video to mark as complete</span>
                        )}
                      </DialogDescription>
                    )}
                  </DialogHeader>
                  <div className="p-4">
                    <video
                      ref={videoRef}
                      controls
                      className="w-full rounded-lg"
                      src={selectedVideo}
                      autoPlay
                      onEnded={handleVideoEnded}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {isInCall && isAuthenticated && courseId && (
              <VideoCall
                roomId={courseId}
                userId={studentId}
                isInitiator={true}
                courseTitle={course?.title}
                onEndCall={handleEndCall}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default React.memo(CourseDetailsPage);
