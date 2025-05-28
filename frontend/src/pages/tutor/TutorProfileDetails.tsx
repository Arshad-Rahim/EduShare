import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { toast } from "sonner";
import {
  FileIcon,
  UploadIcon,
  XIcon,
  Trash2,
  BookOpen,
  Tag,
  PlusCircle,
  Video,
  EditIcon,
  DeleteIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
import { Link } from "react-router-dom";
import { ConfirmationModal } from "@/components/modal-components/ConformationModal";
import { ClipLoader } from "react-spinners";
import { Progress } from "@/components/ui/progress";
import { Course, courseService, Lesson } from "@/services/courseService";

function TutorCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [addLessonModalOpen, setAddLessonModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [confirmDeleteCourseOpen, setConfirmDeleteCourseOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [confirmDeleteLessonOpen, setConfirmDeleteLessonOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(3);
  const [totalCourses, setTotalCourses] = useState(0);

  const fetchCourses = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const response = await courseService.getSpecificTutorCourse(
          page,
          coursesPerPage
        );
        if (response?.data) {
          setCourses(response.data.courses || []);
          setTotalCourses(response.data.totalCourses || 0);
        } else {
          setCourses([]);
          setTotalCourses(0);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setIsLoading(false);
      }
    },
    [coursesPerPage]
  );

  const fetchLessons = useCallback(async (courseId: string) => {
    setIsLoading(true);
    try {
      const response = await courseService.getLessons(courseId);
      setLessons(response?.data.lessons || []);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteCourse = useCallback((courseId: string) => {
    setCourseToDelete(courseId);
    setConfirmDeleteCourseOpen(true);
  }, []);

  const confirmDeleteCourse = useCallback(async () => {
    if (!courseToDelete) return;

    setIsLoading(true);
    try {
      const response = await courseService.deleteCourse(courseToDelete);
      if (response) {
        toast.success(response.data.message);
      }
      fetchCourses(currentPage);
      if (courses.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Failed to delete course:", error);
    } finally {
      setIsLoading(false);
      setConfirmDeleteCourseOpen(false);
      setCourseToDelete(null);
    }
  }, [courseToDelete, currentPage, courses.length, fetchCourses]);

  const handleDeleteLesson = useCallback((lessonId: string) => {
    setLessonToDelete(lessonId);
    setConfirmDeleteLessonOpen(true);
  }, []);

  const confirmDeleteLesson = useCallback(async () => {
    if (!lessonToDelete) return;

    setIsLoading(true);
    try {
      const response = await courseService.deleteLesson(lessonToDelete);
      setLessons(lessons.filter((lesson) => lesson._id !== lessonToDelete));
      toast.success(response.data.message);
    } catch (error) {
      console.error("Failed to delete lesson:", error);
    } finally {
      setIsLoading(false);
      setConfirmDeleteLessonOpen(false);
      setLessonToDelete(null);
    }
  }, [lessonToDelete, lessons]);

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

  const totalPages = useMemo(
    () => Math.ceil(totalCourses / coursesPerPage),
    [totalCourses, coursesPerPage]
  );

  const paginate = useCallback(
    (pageNumber: number) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
      }
    },
    [totalPages]
  );

  useEffect(() => {
    fetchCourses(currentPage);
  }, [currentPage, fetchCourses]);

  interface CourseFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: Course | null;
    onCourseSaved: () => void;
    isEditMode?: boolean;
  }

  const CourseFormModal = memo(function CourseFormModal({
    open,
    onOpenChange,
    course,
    onCourseSaved,
    isEditMode = false,
  }: CourseFormModalProps) {
    const [title, setTitle] = useState(course?.title || "");
    const [tagline, setTagline] = useState(course?.tagline || "");
    const [category, setCategory] = useState(course?.category || "");
    const [difficulty, setDifficulty] = useState(course?.difficulty || "");
    const [price, setPrice] = useState(course?.price?.toString() || "");
    const [about, setAbout] = useState(course?.about || "");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [existingThumbnailUrl, setExistingThumbnailUrl] = useState(
      course?.thumbnail || null
    );
    const [formLoading, setFormLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          if (file.size > 2 * 1024 * 1024) {
            toast.error("Thumbnail size should not exceed 2MB");
            return;
          }
          if (!["image/jpeg", "image/png"].includes(file.type)) {
            toast.error("Only JPG and PNG files are allowed");
            return;
          }
          setSelectedFile(file);
          setExistingThumbnailUrl(null);
          toast.success("Thumbnail selected successfully");
        }
      },
      []
    );

    const triggerFileInput = useCallback(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, []);

    const removeFile = useCallback(() => {
      setSelectedFile(null);
      setExistingThumbnailUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, []);

    const handleSave = useCallback(async () => {
      if (!title || !tagline || !category || !difficulty || !price || !about) {
        toast.error("Please fill out all required fields");
        return;
      }

      if (!/^\d+(\.\d{1,2})?$/.test(price)) {
        toast.error("Price must be a valid number (e.g., 49.99)");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("tagline", tagline);
      formData.append("category", category);
      formData.append("difficulty", difficulty);
      formData.append("price", price);
      formData.append("about", about);
      if (selectedFile) {
        formData.append("thumbnail", selectedFile);
      }

      setFormLoading(true);
      try {
        if (isEditMode && course?._id) {
          const response = await courseService.editCourse(course._id, formData);
          toast.success(response.data.message);
        } else {
          const response = await courseService.addCourse(formData);
          toast.success(response.data.message || "Course added successfully!");
        }
        onOpenChange(false);
        onCourseSaved();
        setTitle("");
        setTagline("");
        setCategory("");
        setDifficulty("");
        setPrice("");
        setAbout("");
        setSelectedFile(null);
        setExistingThumbnailUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        console.error("Failed to save course:", error);
        toast.error(`Failed to ${isEditMode ? "update" : "add"} course`);
      } finally {
        setFormLoading(false);
      }
    }, [
      title,
      tagline,
      category,
      difficulty,
      price,
      about,
      selectedFile,
      isEditMode,
      course?._id,
      onOpenChange,
      onCourseSaved,
    ]);

    const getShortenedThumbnailName = useCallback((url: string | null) => {
      let thumbnailName = url
        ? url.split("/").pop() || "Current Thumbnail"
        : "Current Thumbnail";
      thumbnailName = decodeURIComponent(thumbnailName);
      thumbnailName = thumbnailName.split("?")[0];
      if (thumbnailName.length > 20) {
        thumbnailName = `${thumbnailName.substring(
          0,
          10
        )}...${thumbnailName.substring(thumbnailName.length - 7)}`;
      }
      return thumbnailName;
    }, []);

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Course" : "Add New Course"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                placeholder="e.g., Learn React Basics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tag Line</Label>
              <Input
                id="tagline"
                placeholder="e.g., Master React in 30 Days"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={formLoading}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Web Development">
                    Web Development
                  </SelectItem>
                  <SelectItem value="Mobile Development">
                    Mobile Development
                  </SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Programming">Programming</SelectItem>
                  <SelectItem value="Cloud Computing">
                    Cloud Computing
                  </SelectItem>
                  <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                  <SelectItem value="AI & Machine Learning">
                    AI & Machine Learning
                  </SelectItem>
                  <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={setDifficulty}
                disabled={formLoading}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="text"
                placeholder="e.g., 49.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="about">About</Label>
              <Textarea
                id="about"
                placeholder="Describe your course..."
                className="min-h-[100px]"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnail" className="text-sm font-medium">
                Course Thumbnail
              </Label>
              <div
                className="border-2 border-dashed rounded-lg border-primary/50 hover:border-primary cursor-pointer transition-colors"
                onClick={triggerFileInput}
              >
                <div className="p-4 flex flex-col items-center justify-center gap-2">
                  <Input
                    ref={fileInputRef}
                    id="thumbnail"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={formLoading}
                  />
                  {selectedFile ? (
                    <div className="w-full flex items-center p-2 bg-muted/50 rounded-md">
                      <FileIcon className="h-5 w-5 text-primary" />
                      <div className="ml-2 flex-1 truncate">
                        <p className="text-sm font-medium">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : existingThumbnailUrl ? (
                    <div className="w-full flex items-center p-2 bg-muted/50 rounded-md">
                      <img
                        src={existingThumbnailUrl}
                        alt="Current Thumbnail"
                        className="h-10 w-10 object-cover rounded mr-2"
                      />
                      <div className="flex-1 truncate">
                        <p className="text-sm font-medium">
                          {getShortenedThumbnailName(existingThumbnailUrl)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Existing Thumbnail
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UploadIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          <span className="text-primary">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG or PNG (max 2MB)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {(selectedFile || existingThumbnailUrl) && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    disabled={formLoading}
                  >
                    <XIcon className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={formLoading}>
                {formLoading ? (
                  <ClipLoader size={20} color="#ffffff" />
                ) : isEditMode ? (
                  "Save"
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  });

  interface LessonFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    onLessonSaved: () => void;
  }

  const LessonFormModal = memo(function LessonFormModal({
    open,
    onOpenChange,
    courseId,
    onLessonSaved,
  }: LessonFormModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [duration, setDuration] = useState("");
    const [order, setOrder] = useState("");
    const [formLoading, setFormLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [displayProgress, setDisplayProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (!formLoading || uploadProgress === 0) return;

      const interval = setInterval(() => {
        setDisplayProgress((prev) => {
          const diff = uploadProgress - prev;
          if (diff <= 0) return prev;
          const step = Math.min(diff, 0.5);
          const newProgress = prev + step;
          if (newProgress >= 100 && uploadProgress === 100) {
            setIsProcessing(true);
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }, [formLoading, uploadProgress]);

    const handleFileChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
          if (selectedFile.size > 50 * 1024 * 1024) {
            toast.error("Lesson file size should not exceed 50MB");
            return;
          }
          if (!["video/mp4", "video/webm"].includes(selectedFile.type)) {
            toast.error("Only MP4 and WebM files are allowed");
            return;
          }
          setFile(selectedFile);
          toast.success("Lesson file selected successfully");
        }
      },
      []
    );

    const triggerFileInput = useCallback(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, []);

    const removeFile = useCallback(() => {
      setFile(null);
      setUploadProgress(0);
      setDisplayProgress(0);
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, []);

    const handleSaveLesson = useCallback(async () => {
      if (!title || !description || !file) {
        toast.error(
          "Please fill out all required fields (title, description, file)"
        );
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("courseId", courseId);
      formData.append("description", description);
      formData.append("file", file);
      if (duration) formData.append("duration", duration);
      if (order) formData.append("order", order);

      setFormLoading(true);
      try {
        await authAxiosInstance.post("/lessons/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            if (total) {
              const percent = Math.floor((loaded * 100) / total);
              setUploadProgress(percent);
            }
          },
        });
        toast.success("Lesson added successfully!");
        onOpenChange(false);
        onLessonSaved();
        setTitle("");
        setDescription("");
        setFile(null);
        setDuration("");
        setOrder("");
        setUploadProgress(0);
        setDisplayProgress(0);
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        console.error("Failed to add lesson:", error);
        toast.error("Failed to add lesson");
      } finally {
        setFormLoading(false);
        setIsProcessing(false);
      }
    }, [
      title,
      description,
      file,
      duration,
      order,
      courseId,
      onOpenChange,
      onLessonSaved,
    ]);

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Lesson Title</Label>
              <Input
                id="lesson-title"
                placeholder="e.g., Introduction to React"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-description">Description</Label>
              <Textarea
                id="lesson-description"
                placeholder="Describe the lesson..."
                className="min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-file">Lesson Video</Label>
              <div
                className="border-2 border-dashed rounded-lg border-primary/50 hover:border-primary cursor-pointer transition-colors"
                onClick={triggerFileInput}
              >
                <div className="p-4 flex flex-col items-center justify-center gap-2">
                  <Input
                    ref={fileInputRef}
                    id="lesson-file"
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={formLoading}
                  />
                  {file ? (
                    <div className="w-full flex items-center p-2 bg-muted/50 rounded-md">
                      <FileIcon className="h-5 w-5 text-primary" />
                      <div className="ml-2 flex-1 truncate">
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UploadIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          <span className="text-primary">Click to upload</span>{" "}
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
              {file && (
                <div className="space-y-2">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      disabled={formLoading}
                    >
                      <XIcon className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                  {formLoading && (
                    <div className="space-y-1">
                      {displayProgress < 100 ? (
                        <>
                          <Progress
                            value={displayProgress}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground text-center">
                            Uploading: {Math.floor(displayProgress)}%
                          </p>
                        </>
                      ) : isProcessing ? (
                        <div className="flex items-center justify-center gap-2">
                          <ClipLoader size={20} color="#3b82f6" />
                          <p className="text-xs text-muted-foreground">
                            Processing on server...
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-0">
              <Label htmlFor="lesson-duration">Duration (minutes)</Label>
              <Input
                id="lesson-duration"
                type="number"
                placeholder="e.g., 15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={formLoading}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveLesson}
                disabled={formLoading}
              >
                {formLoading ? (
                  <ClipLoader size={20} color="#ffffff" />
                ) : (
                  "Add Lesson"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  });

  const loadingUI = useMemo(
    () => (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50 w-full">
        <ClipLoader size={50} color="#3b82f6" />
      </div>
    ),
    []
  );

  const noCoursesUI = useMemo(
    () => (
      <div className="text-center py-12 bg-gray-100 rounded-lg border-gray-200 bg-opacity-75 w-full">
        <BookOpen className="h-12 w-12 text-gray-300 mx-auto" />
        <h3 className="text-lg font-medium text-center">
          No courses available
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          You haven’t created any courses yet. Add your first course to start
          building your catalog.
        </p>
        <Button
          onClick={() => setAddModalOpen(true)}
          variant="outline"
          className="border-blue-500 text-blue-500 hover:bg-blue-50"
          disabled={isLoading}
        >
          Create Your First Course
        </Button>
      </div>
    ),
    [isLoading]
  );

  const coursesUI = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {courses.map((course) => (
          <Card
            key={course._id}
            className="overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200 h-full flex flex-col w-full"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-2">
                <Badge className={getDifficultyColor(course.difficulty)}>
                  {course.difficulty}
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold line-clamp-1">
                {course.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {course.tagline}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Tag className="h-4 w-4" />
                    <span>{course.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <span className="font-medium">₹{course.price}</span>
                  </div>
                </div>
                <Separator />
                <p className="text-sm text-gray-600 line-clamp-3">
                  {course.about}
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex flex-col gap-2 w-full">
              <div className="flex justify-between w-full gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    setSelectedCourse(course);
                    setEditModalOpen(true);
                  }}
                  disabled={isLoading}
                >
                  <EditIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  onClick={() => handleDeleteCourse(course._id)}
                  disabled={isLoading}
                >
                  <DeleteIcon className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
              <div className="flex justify-between w-full gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => {
                    setSelectedCourse(course);
                    fetchLessons(course._id);
                    setLessonModalOpen(true);
                  }}
                  disabled={isLoading}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Manage Lessons
                </Button>
                <Link to={`/tutor/courses/${course._id}`} className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white"
                    disabled={isLoading}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    ),
    [courses, isLoading, getDifficultyColor, handleDeleteCourse, fetchLessons]
  );

  const paginationUI = useMemo(
    () =>
      totalPages > 1 ? (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="border-gray-300 hover:bg-gray-50"
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => paginate(page)}
                disabled={isLoading}
                className={
                  currentPage === page
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                }
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="border-gray-300 hover:bg-gray-50"
          >
            Next
          </Button>
        </div>
      ) : null,
    [currentPage, totalPages, isLoading, paginate]
  );

  const lessonsDialogUI = useMemo(
    () =>
      lessonModalOpen && selectedCourse ? (
        <Dialog open={lessonModalOpen} onOpenChange={setLessonModalOpen}>
          <DialogContent className="w-full sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                Manage Lessons for {selectedCourse.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Button
                onClick={() => setAddLessonModalOpen(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isLoading}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Lesson
              </Button>
              {lessons.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 w-full">
                  <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No lessons added yet.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto w-full">
                  {lessons.map((lesson) => (
                    <div
                      key={lesson._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Video className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">{lesson.title}</p>
                          <p className="text-xs text-gray-500">
                            {lesson.duration
                              ? `${lesson.duration} min`
                              : "No duration"}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteLesson(lesson._id)}
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      ) : null,
    [lessonModalOpen, selectedCourse, lessons, isLoading, handleDeleteLesson]
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col w-full">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col md:flex-row gap-6 p-6 w-full">
        <div className="w-full md:w-64 flex-shrink-0">
          <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
        <div
          className={`flex-1 w-full relative ${sidebarOpen ? "md:ml-64" : ""}`}
        >
          {isLoading && loadingUI}
          <div className="space-y-8 w-full">
            <Card className="border-0 shadow-md w-full">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
                <div className="flex justify-between items-center flex-col sm:flex-row gap-4 sm:gap-0 w-full">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                      Manage Courses
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Create, edit, and manage your course catalog
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setAddModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                    disabled={isLoading}
                  >
                    Add Course
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 w-full">
                {courses.length === 0 && currentPage === 1 ? (
                  noCoursesUI
                ) : (
                  <>
                    {coursesUI}
                    {paginationUI}
                  </>
                )}
              </CardContent>
            </Card>
            {lessonsDialogUI}
            <CourseFormModal
              open={addModalOpen}
              onOpenChange={setAddModalOpen}
              course={null}
              onCourseSaved={() => fetchCourses(currentPage)}
            />
            <CourseFormModal
              open={editModalOpen}
              onOpenChange={setEditModalOpen}
              course={selectedCourse}
              onCourseSaved={() => fetchCourses(currentPage)}
              isEditMode={true}
            />
            {addLessonModalOpen && selectedCourse && (
              <LessonFormModal
                open={addLessonModalOpen}
                onOpenChange={setAddLessonModalOpen}
                courseId={selectedCourse._id}
                onLessonSaved={() => fetchLessons(selectedCourse._id)}
              />
            )}
            <ConfirmationModal
              isOpen={confirmDeleteCourseOpen}
              onClose={() => setConfirmDeleteCourseOpen(false)}
              onConfirm={confirmDeleteCourse}
              title="Delete Course?"
              description="Are you sure you want to delete this course? This action cannot be undone."
              confirmText="Delete"
              cancelText="Cancel"
              isLoading={isLoading}
            />
            <ConfirmationModal
              isOpen={confirmDeleteLessonOpen}
              onClose={() => setConfirmDeleteLessonOpen(false)}
              onConfirm={confirmDeleteLesson}
              title="Delete Lesson?"
              description="Are you sure you want to delete lesson? This action cannot be undone."
              confirmText="Delete"
              cancelText="Cancel"
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(TutorCourses);
