

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "./components/Header";
import { SideBar } from "./components/SideBar";
import { toast } from "sonner";
import {
  BookOpen,
  Tag,
  DollarSign,
  Video,
  ArrowLeft,
  Clock,
  Pencil,
  Upload,
  FileIcon,
} from "lucide-react";
import { Course, courseService, Lesson } from "@/services/courseService";
import { useSelector } from "react-redux";
import { VideoCall } from "@/components/videoCall/VideoCall";

export function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editLessonModalOpen, setEditLessonModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState("");
  const [editLessonDuration, setEditLessonDuration] = useState("");
  const [editLessonVideoFile, setEditLessonVideoFile] = useState<File | null>(
    null
  );
  const [currentVideoName, setCurrentVideoName] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = useSelector((state: any) => state.user.userDatas);
  const tutorId = currentUser?.id ? currentUser?.id : currentUser?._id;

  // Check for call query parameter
  const queryParams = new URLSearchParams(location.search);
  const callRoomId = queryParams.get("call");

  useEffect(() => {
    fetchCourseDetails();
    fetchLessons();
  }, [courseId]);

  useEffect(() => {
    if (callRoomId) {
      console.log("Call query detected, starting video call:", callRoomId);
      setIsInCall(true);
    }
  }, [callRoomId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await courseService.getSpecificTutorCourse(1, 50);
      if (response?.data?.courses) {
        const foundCourse = response.data.courses.find(
          (c: Course) => c._id === courseId
        );
        if (foundCourse) {
          setCourse(foundCourse);
        } else {
          toast.error("Course not found");
          navigate("/tutor/courses");
        }
      } else {
        toast.error("No course data received");
        navigate("/tutor/courses");
      }
    } catch (error) {
      console.error("Failed to fetch course details:", error);
      toast.error("Failed to load course details");
      navigate("/tutor/courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      if (courseId) {
        const response = await courseService.getLessons(courseId);
        if (response) {
          setLessons(response.data.lessons || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
      toast.error("Failed to load lessons");
    }
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

  const handlePlayVideo = (lesson: Lesson) => {
    const videoUrl = lesson.file;
    if (videoUrl) {
      setSelectedVideo(videoUrl);
      setVideoModalOpen(true);
    } else {
      toast.error("No video available for this lesson");
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setEditLessonTitle(lesson.title);
    setEditLessonDuration(lesson.duration ? String(lesson.duration) : "");
    const videoUrl = lesson.file;

    // Extract a shorter, readable video name and truncate if necessary
    let videoName = videoUrl
      ? videoUrl.split("/").pop() || "Current Video"
      : "No video uploaded";
    // Decode URL-encoded characters (e.g., %20 to space)
    videoName = decodeURIComponent(videoName);
    // Remove query parameters if present (e.g., S3 signed URL params)
    videoName = videoName.split("?")[0];
    // Truncate to 20 characters with ellipsis if too long
    if (videoName.length > 20) {
      videoName = `${videoName.substring(0, 10)}...${videoName.substring(
        videoName.length - 7
      )}`;
    }

    setCurrentVideoName(videoName);
    setEditLessonVideoFile(null);
    setEditLessonModalOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video file size should not exceed 50MB");
        return;
      }
      if (!["video/mp4", "video/webm"].includes(file.type)) {
        toast.error("Only MP4 and WebM files are allowed");
        return;
      }
      setEditLessonVideoFile(file);
      setCurrentVideoName(file.name);
      toast.success("Video file selected successfully");
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSaveLesson = async () => {
    if (!selectedLesson || !editLessonTitle) {
      toast.error("Please fill out the title field");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", editLessonTitle);
      formData.append(
        "duration",
        editLessonDuration ? String(parseInt(editLessonDuration)) : ""
      );
      if (editLessonVideoFile) {
        formData.append("file", editLessonVideoFile);
      }
      const response = await courseService.editLesson(
        selectedLesson._id,
        formData
      );

      if (response.data.success) {
        const updatedLesson: Lesson = {
          ...selectedLesson,
          title: editLessonTitle,
          duration: editLessonDuration
            ? parseInt(editLessonDuration)
            : undefined,
          file: editLessonVideoFile
            ? URL.createObjectURL(editLessonVideoFile)
            : selectedLesson.file,
        };

        setLessons((prevLessons) =>
          prevLessons.map((lesson) =>
            lesson._id === selectedLesson._id ? updatedLesson : lesson
          )
        );
        toast.success("Lesson updated successfully");
        setEditLessonModalOpen(false);
      } else {
        toast.error("Failed to update lesson");
      }
    } catch (error) {
      console.error("Failed to update lesson:", error);
      toast.error("Failed to update lesson");
    }
  };

  const handleEndCall = useCallback(() => {
    console.log("Call ended, isInCall set to false");
    setIsInCall(false);
    navigate(`/tutor/courses/${courseId}`);
  }, [courseId, navigate]);

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
      <div className="flex flex-col md:flex-row gap-6 p-6 w-full">
        <div className="w-full md:w-64 flex-shrink-0">
          <SideBar sidebarOpen={true} />
        </div>
        <div className="flex-1 w-full">
          <Card className="border-0 shadow-md w-full">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
              <div className="flex justify-between items-center flex-col sm:flex-row gap-4 sm:gap-0">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {course.title}
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => navigate("/tutor/courses")}
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
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Tag className="h-4 w-4" />
                      <span>{course.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">₹{course.price}</span>
                    </div>
                  </div>
                </div>
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
                        <p className="text-slate-500">No lessons added yet.</p>
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
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePlayVideo(lesson)}
                              >
                                <Video className="h-4 w-4 text-primary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditLesson(lesson)}
                              >
                                <Pencil className="h-4 w-4 text-primary" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Playback Modal */}
          {videoModalOpen && selectedVideo && (
            <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
              <DialogContent className="sm:max-w-[800px] w-full">
                <DialogHeader>
                  <DialogTitle>Lesson Video</DialogTitle>
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

          {/* Edit Lesson Modal */}
          {editLessonModalOpen && selectedLesson && (
            <Dialog
              open={editLessonModalOpen}
              onOpenChange={setEditLessonModalOpen}
            >
              <DialogContent className="sm:max-w-[500px] w-full">
                <DialogHeader>
                  <DialogTitle>Edit Lesson</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-lesson-title">Lesson Title</Label>
                    <Input
                      id="edit-lesson-title"
                      value={editLessonTitle}
                      onChange={(e) => setEditLessonTitle(e.target.value)}
                      placeholder="e.g., Introduction to React"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lesson-duration">
                      Duration (minutes)
                    </Label>
                    <Input
                      id="edit-lesson-duration"
                      type="number"
                      value={editLessonDuration}
                      onChange={(e) => setEditLessonDuration(e.target.value)}
                      placeholder="e.g., 15"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lesson-file">Lesson Video</Label>
                    <div
                      className="border-2 border-dashed rounded-lg border-primary/50 hover:border-primary cursor-pointer transition-colors"
                      onClick={triggerFileInput}
                    >
                      <div className="p-4 flex flex-col items-center justify-center gap-2">
                        <Input
                          ref={fileInputRef}
                          id="edit-lesson-file"
                          type="file"
                          accept="video/mp4,video/webm"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {editLessonVideoFile ? (
                          <div className="w-full flex items-center p-2 bg-muted/50 rounded-md">
                            <FileIcon className="h-5 w-5 text-primary" />
                            <div className="ml-2 flex-1 truncate">
                              <p className="text-sm font-medium">
                                {editLessonVideoFile.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(
                                  editLessonVideoFile.size /
                                  1024 /
                                  1024
                                ).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                        ) : currentVideoName !== "No video uploaded" ? (
                          <div className="w-full flex items-center p-2 bg-muted/50 rounded-md">
                            <FileIcon className="h-5 w-5 text-primary" />
                            <div className="ml-2 flex-1 truncate">
                              <p className="text-sm font-medium">
                                {currentVideoName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Existing Video
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Upload className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium">
                                <span className="text-primary">
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                MP4 or WebM (max 50MB)
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setEditLessonModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveLesson}>Save</Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Video Call Modal */}
          {isInCall && callRoomId && course && (
            <VideoCall
              roomId={callRoomId}
              userId={tutorId}
              isInitiator={false}
              courseTitle={course.title}
              onEndCall={handleEndCall}
            />
          )}
        </div>
      </div>
    </div>
  );
}