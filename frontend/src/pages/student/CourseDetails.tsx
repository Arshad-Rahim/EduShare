"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Header } from "./components/Header";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { toast } from "sonner";
import {
  BookOpen,
  Tag,
  Video,
  ArrowLeft,
  Clock,
  Star,
  Users,
} from "lucide-react";

export function CourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null); // State for selected video
  const [videoModalOpen, setVideoModalOpen] = useState(false); // State for video modal

  useEffect(() => {
    fetchCourseDetails();
    fetchLessons();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await authAxiosInstance.get(`/courses/all-courses`); // Adjust endpoint if student-specific
      const foundCourse = response.data.courses.courses.find(
        (c) => c._id === courseId
      );
      console.log("FOUNDCOURSE", response.data.courses);
      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        toast.error("Course not found");
        navigate("/courses");
      }
    } catch (error) {
      console.error("Failed to fetch course details:", error);
      toast.error("Failed to load course details");
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await authAxiosInstance.get(
        `/lessons/course/${courseId}`
      );
      setLessons(response.data.lessons || []);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
      toast.error("Failed to load lessons");
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

  const handlePlayVideo = (lesson, index) => {
    const videoUrl = lesson.file || lesson.videoUrl;
    if (videoUrl) {
      if (index === 0) {
        // First lesson is free
        setSelectedVideo(videoUrl);
        setVideoModalOpen(true);
      } else {
        toast.info("Please enroll to access this lesson");
        navigate(`/course/${courseId}/enroll`);
      }
    } else {
      toast.error("No video available for this lesson");
    }
  };

  const handleEnroll = () => {
    navigate(`/course/${courseId}/enroll`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center w-full">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col w-full">
      <Header />
      <main className="flex-1 w-full">
        <section className="w-full py-12">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <Card className="border-0 shadow-md w-full">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
                <div className="flex justify-between items-center flex-col sm:flex-row gap-4 sm:gap-0">
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    {course.title}
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/courses")}
                    className="border-slate-300 hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Courses
                  </Button>
                </div>
                <CardDescription className="text-slate-600 mt-2">
                  {course.tagline}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Thumbnail and Basic Info */}
                  <div className="lg:col-span-1">
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200">
                          <BookOpen className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={getDifficultyColor(course.difficulty)}
                        >
                          {course.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Tag className="h-4 w-4" />
                        <span>{course.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="font-medium">₹{course.price}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="h-4 w-4" />
                        <span>{course.enrollments || 0} students enrolled</span>
                      </div>
                      <div className="flex items-center gap-1">
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
                        <span className="text-sm ml-2">4.0 (mock rating)</span>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-6 bg-primary hover:bg-primary/90"
                      onClick={handleEnroll}
                    >
                      Enroll Now
                    </Button>
                  </div>
                  {/* Right Column: Description and Lessons */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        About This Course
                      </h3>
                      <p className="text-sm text-slate-600 mt-2">
                        {course.about}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Lessons
                      </h3>
                      {lessons.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200 mt-4">
                          <Video className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-500">
                            No lessons added yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto">
                          {lessons.map((lesson, index) => (
                            <div
                              key={lesson._id}
                              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                                  <span className="text-sm font-medium text-primary">
                                    {index + 1}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {lesson.title}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {lesson.duration
                                        ? `${lesson.duration} min`
                                        : "No duration"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePlayVideo(lesson, index)}
                              >
                                <Video className="h-4 w-4 text-primary" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Video Modal */}
            {videoModalOpen && selectedVideo && (
              <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
                <DialogContent className="sm:max-w-[800px] w-full">
                  <DialogHeader>
                    <DialogTitle>Lesson Preview</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <video
                      controls
                      className="w-full rounded-lg"
                      src={selectedVideo}
                      autoPlay
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
