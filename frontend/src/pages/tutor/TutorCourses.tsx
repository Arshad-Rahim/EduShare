// "use client";

// import type React from "react";
// import { useState, useEffect, useRef } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { authAxiosInstance } from "@/api/authAxiosInstance";
// import { toast } from "sonner";
// import {
//   FileIcon,
//   UploadIcon,
//   XIcon,
//   Pencil,
//   Trash2,
//   BookOpen,
//   Tag,
//   DollarSign,
//   PlusCircle,
//   Video,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Header } from "./components/Header";
// import { SideBar } from "./components/SideBar";

// export function TutorCourses() {
//   const [courses, setCourses] = useState([]);
//   const [addModalOpen, setAddModalOpen] = useState(false);
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [lessonModalOpen, setLessonModalOpen] = useState(false);
//   const [addLessonModalOpen, setAddLessonModalOpen] = useState(false);
//   const [selectedCourse, setSelectedCourse] = useState(null);
//   const [lessons, setLessons] = useState([]);

//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   const fetchCourses = async () => {
//     try {
//       const response = await authAxiosInstance.get("/courses/my-courses");
//       setCourses(response.data.courses || []);
//     } catch (error) {
//       console.error("Failed to fetch courses:", error);
//       toast.error("Failed to load courses");
//     }
//   };

//   const fetchLessons = async (courseId) => {
//     try {
//       const response = await authAxiosInstance.get(
//         `/lessons/course/${courseId}`
//       );
//       setLessons(response.data.lessons || []);
//     } catch (error) {
//       console.error("Failed to fetch lessons:", error);
//       toast.error("Failed to load lessons");
//     }
//   };

//   const handleDeleteCourse = async (courseId: string) => {
//     try {
//       const response = await authAxiosInstance.delete(
//         `/courses/delete/${courseId}`
//       );
//       setCourses(courses.filter((course) => course._id !== courseId));
//       toast.success(response.data.message);
//     } catch (error) {
//       console.error("Failed to delete course:", error);
//       toast.error("Failed to delete course");
//     }
//   };

//   const getDifficultyColor = (difficulty) => {
//     switch (difficulty) {
//       case "Beginner":
//         return "bg-emerald-100 text-emerald-800";
//       case "Intermediate":
//         return "bg-amber-100 text-amber-800";
//       case "Advanced":
//         return "bg-rose-100 text-rose-800";
//       default:
//         return "bg-slate-100 text-slate-800";
//     }
//   };

//   const CourseFormModal = ({
//     open,
//     onOpenChange,
//     course,
//     onCourseSaved,
//     isEditMode = false,
//   }) => {
//     const [title, setTitle] = useState(course?.title || "");
//     const [tagline, setTagline] = useState(course?.tagline || "");
//     const [category, setCategory] = useState(course?.category || "");
//     const [difficulty, setDifficulty] = useState(course?.difficulty || "");
//     const [price, setPrice] = useState(course?.price?.toString() || "");
//     const [about, setAbout] = useState(course?.about || "");
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<
//       string | null
//     >(course?.thumbnailUrl || null);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//       const file = event.target.files?.[0];
//       if (file) {
//         if (file.size > 2 * 1024 * 1024) {
//           toast.error("Thumbnail size should not exceed 2MB");
//           return;
//         }
//         if (!["image/jpeg", "image/png"].includes(file.type)) {
//           toast.error("Only JPG and PNG files are allowed");
//           return;
//         }
//         setSelectedFile(file);
//         setExistingThumbnailUrl(null);
//         toast.success("Thumbnail selected successfully");
//       }
//     };

//     const triggerFileInput = () => {
//       if (fileInputRef.current) {
//         fileInputRef.current.click();
//       }
//     };

//     const removeFile = () => {
//       setSelectedFile(null);
//       setExistingThumbnailUrl(null);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     };

//     const handleSave = async () => {
//       if (!title || !tagline || !category || !difficulty || !price || !about) {
//         toast.error("Please fill out all required fields");
//         return;
//       }

//       if (!/^\d+(\.\d{1,2})?$/.test(price)) {
//         toast.error("Price must be a valid number (e.g., 49.99)");
//         return;
//       }

//       const formData = new FormData();
//       formData.append("title", title);
//       formData.append("tagline", tagline);
//       formData.append("category", category);
//       formData.append("difficulty", difficulty);
//       formData.append("price", price);
//       formData.append("about", about);
//       if (selectedFile) {
//         formData.append("thumbnail", selectedFile);
//       }

//       try {
//         console.log("ISEDITMODE", isEditMode);
//         console.log("COURSE ID", course?._id);
//         if (isEditMode && course?._id) {
//           const response = await authAxiosInstance.put(
//             `/courses/update/${course._id}`,
//             formData,
//             {
//               headers: { "Content-Type": "multipart/form-data" },
//             }
//           );
//           toast.success(response.data.message);
//         } else {
//           await authAxiosInstance.post("/courses/add", formData, {
//             headers: { "Content-Type": "multipart/form-data" },
//           });
//           toast.success("Course added successfully!");
//         }
//         onOpenChange(false);
//         onCourseSaved();
//         setTitle("");
//         setTagline("");
//         setCategory("");
//         setDifficulty("");
//         setPrice("");
//         setAbout("");
//         setSelectedFile(null);
//         if (fileInputRef.current) fileInputRef.current.value = "";
//       } catch (error) {
//         console.error("Failed to save course:", error);
//         toast.error(`Failed to ${isEditMode ? "update" : "add"} course`);
//       }
//     };

//     return (
//       <Dialog open={open} onOpenChange={onOpenChange}>
//         <DialogContent className="sm:max-w-[500px] w-full">
//           <DialogHeader>
//             <DialogTitle>
//               {isEditMode ? "Edit Course" : "Add New Course"}
//             </DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="title">Course Title</Label>
//               <Input
//                 id="title"
//                 placeholder="e.g., Learn React Basics"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="tagline">Tag Line</Label>
//               <Input
//                 id="tagline"
//                 placeholder="e.g., Master React in 30 Days"
//                 value={tagline}
//                 onChange={(e) => setTagline(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="category">Category</Label>
//               <Select value={category} onValueChange={setCategory}>
//                 <SelectTrigger id="category">
//                   <SelectValue placeholder="Select a category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Web Development">
//                     Web Development
//                   </SelectItem>
//                   <SelectItem value="Mobile Development">
//                     Mobile Development
//                   </SelectItem>
//                   <SelectItem value="Data Science">Data Science</SelectItem>
//                   <SelectItem value="Programming">Programming</SelectItem>
//                   <SelectItem value="Other">Other</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="difficulty">Difficulty</Label>
//               <Select value={difficulty} onValueChange={setDifficulty}>
//                 <SelectTrigger id="difficulty">
//                   <SelectValue placeholder="Select difficulty level" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Beginner">Beginner</SelectItem>
//                   <SelectItem value="Intermediate">Intermediate</SelectItem>
//                   <SelectItem value="Advanced">Advanced</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="price">Price ($)</Label>
//               <Input
//                 id="price"
//                 type="text"
//                 placeholder="e.g., 49.99"
//                 value={price}
//                 onChange={(e) => setPrice(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="about">About</Label>
//               <Textarea
//                 id="about"
//                 placeholder="Describe your course..."
//                 className="min-h-[100px]"
//                 value={about}
//                 onChange={(e) => setAbout(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="thumbnail" className="text-sm font-medium">
//                 Course Thumbnail
//               </Label>
//               <div
//                 className="border-2 border-dashed rounded-lg border-primary/50 hover:border-primary cursor-pointer transition-colors"
//                 onClick={triggerFileInput}
//               >
//                 <div className="p-4 flex flex-col items-center justify-center gap-2">
//                   <Input
//                     ref={fileInputRef}
//                     id="thumbnail"
//                     type="file"
//                     accept="image/jpeg,image/png"
//                     onChange={handleFileChange}
//                     className="hidden"
//                   />
//                   {selectedFile ? (
//                     <div className="w-full flex items-center p-2 bg-muted/50 rounded-md">
//                       <FileIcon className="h-5 w-5 text-primary" />
//                       <div className="ml-2 flex-1 truncate">
//                         <p className="text-sm font-medium">
//                           {selectedFile.name}
//                         </p>
//                         <p className="text-xs text-muted-foreground">
//                           {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
//                         </p>
//                       </div>
//                     </div>
//                   ) : existingThumbnailUrl ? (
//                     <div className="w-full flex items-center p-2 bg-muted/50 rounded-md">
//                       <FileIcon className="h-5 w-5 text-primary" />
//                       <div className="ml-2 flex-1 truncate">
//                         <p className="text-sm font-medium">
//                           {existingThumbnailUrl.split("/").pop() || "Thumbnail"}
//                         </p>
//                         <p className="text-xs text-muted-foreground">
//                           Existing Thumbnail
//                         </p>
//                       </div>
//                     </div>
//                   ) : (
//                     <>
//                       <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
//                         <UploadIcon className="h-5 w-5 text-primary" />
//                       </div>
//                       <div className="text-center">
//                         <p className="text-sm font-medium">
//                           <span className="text-primary">Click to upload</span>{" "}
//                           or drag and drop
//                         </p>
//                         <p className="text-xs text-muted-foreground mt-1">
//                           JPG or PNG (max 2MB)
//                         </p>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>
//               {(selectedFile || existingThumbnailUrl) && (
//                 <div className="flex justify-end">
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       removeFile();
//                     }}
//                   >
//                     <XIcon className="h-3 w-3 mr-1" />
//                     Remove
//                   </Button>
//                 </div>
//               )}
//             </div>
//             <div className="flex justify-end space-x-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => onOpenChange(false)}
//               >
//                 Cancel
//               </Button>
//               <Button type="button" onClick={handleSave}>
//                 {isEditMode ? "Save" : "Add"}
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
//   };

//   const LessonFormModal = ({ open, onOpenChange, courseId, onLessonSaved }) => {
//     const [title, setTitle] = useState("");
//     const [description, setDescription] = useState("");
//     const [file, setFile] = useState<File | null>(null);
//     const [duration, setDuration] = useState("");
//     const [order, setOrder] = useState("");
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//       const selectedFile = event.target.files?.[0];
//       if (selectedFile) {
//         if (selectedFile.size > 10 * 1024 * 1024) {
//           toast.error("Lesson file size should not exceed 10MB");
//           return;
//         }
//         if (!["video/mp4", "video/webm"].includes(selectedFile.type)) {
//           toast.error("Only MP4 and WebM files are allowed");
//           return;
//         }
//         setFile(selectedFile);
//         toast.success("Lesson file selected successfully");
//       }
//     };

//     const triggerFileInput = () => {
//       if (fileInputRef.current) fileInputRef.current.click();
//     };

//     const removeFile = () => {
//       setFile(null);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     };

//     const handleSaveLesson = async () => {
//       if (!title || !description || !file) {
//         toast.error(
//           "Please fill out all required fields (title, description, file)"
//         );
//         return;
//       }

//       const formData = new FormData();
//       formData.append("title", title);
//       formData.append("courseId", courseId);
//       formData.append("description", description);
//       formData.append("file", file);
//       if (duration) formData.append("duration", duration);
//       // if (order) formData.append("order", order);

//       try {
//         await authAxiosInstance.post("/lessons/add", formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//         toast.success("Lesson added successfully!");
//         onOpenChange(false);
//         onLessonSaved();
//         setTitle("");
//         setDescription("");
//         setFile(null);
//         setDuration("");
//         setOrder("");
//         if (fileInputRef.current) fileInputRef.current.value = "";
//       } catch (error) {
//         console.error("Failed to add lesson:", error);
//         toast.error("Failed to add lesson");
//       }
//     };

//     return (
//       <Dialog open={open} onOpenChange={onOpenChange}>
//         <DialogContent className="sm:max-w-[500px] w-full">
//           <DialogHeader>
//             <DialogTitle>Add New Lesson</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="lesson-title">Lesson Title</Label>
//               <Input
//                 id="lesson-title"
//                 placeholder="e.g., Introduction to React"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="lesson-description">Description</Label>
//               <Textarea
//                 id="lesson-description"
//                 placeholder="Describe the lesson..."
//                 className="min-h-[100px]"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="lesson-file">Lesson Video</Label>
//               <div
//                 className="border-2 border-dashed rounded-lg border-primary/50 hover:border-primary cursor-pointer transition-colors"
//                 onClick={triggerFileInput}
//               >
//                 <div className="p-4 flex flex-col items-center justify-center gap-2">
//                   <Input
//                     ref={fileInputRef}
//                     id="lesson-file"
//                     type="file"
//                     accept="video/mp4,video/webm"
//                     onChange={handleFileChange}
//                     className="hidden"
//                   />
//                   {file ? (
//                     <div className="w-full flex items-center p-2 bg-muted/50 rounded-md">
//                       <FileIcon className="h-5 w-5 text-primary" />
//                       <div className="ml-2 flex-1 truncate">
//                         <p className="text-sm font-medium">{file.name}</p>
//                         <p className="text-xs text-muted-foreground">
//                           {(file.size / 1024 / 1024).toFixed(2)} MB
//                         </p>
//                       </div>
//                     </div>
//                   ) : (
//                     <>
//                       <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
//                         <UploadIcon className="h-5 w-5 text-primary" />
//                       </div>
//                       <div className="text-center">
//                         <p className="text-sm font-medium">
//                           <span className="text-primary">Click to upload</span>{" "}
//                           or drag and drop
//                         </p>
//                         <p className="text-xs text-muted-foreground mt-1">
//                           MP4 or WebM (max 10MB)
//                         </p>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>
//               {file && (
//                 <div className="flex justify-end">
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       removeFile();
//                     }}
//                   >
//                     <XIcon className="h-3 w-3 mr-1" />
//                     Remove
//                   </Button>
//                 </div>
//               )}
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="lesson-duration">Duration (minutes)</Label>
//               <Input
//                 id="lesson-duration"
//                 type="number"
//                 placeholder="e.g., 15"
//                 value={duration}
//                 onChange={(e) => setDuration(e.target.value)}
//               />
//             </div>
//             {/* <div className="space-y-2">
//               <Label htmlFor="lesson-order">Order</Label>
//               <Input
//                 id="lesson-order"
//                 type="number"
//                 placeholder="e.g., 1"
//                 value={order}
//                 onChange={(e) => setOrder(e.target.value)}
//               />
//             </div> */}
//             <div className="flex justify-end space-x-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => onOpenChange(false)}
//               >
//                 Cancel
//               </Button>
//               <Button type="button" onClick={handleSaveLesson}>
//                 Add Lesson
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col w-full">
//       <Header />
//       <div className="flex flex-col md:flex-row gap-6 p-6 w-full">
//         <div className="w-full md:w-64 flex-shrink-0">
//           <SideBar sidebarOpen={true} />
//         </div>
//         <div className="flex-1 w-full">
//           <div className="space-y-8">
//             <Card className="border-0 shadow-md w-full">
//               <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
//                 <div className="flex justify-between items-center flex-col sm:flex-row gap-4 sm:gap-0">
//                   <div>
//                     <CardTitle className="text-2xl font-bold text-slate-800">
//                       Manage Courses
//                     </CardTitle>
//                     <CardDescription className="text-slate-600">
//                       Create, edit, and manage your course catalog
//                     </CardDescription>
//                   </div>
//                   <Button
//                     onClick={() => setAddModalOpen(true)}
//                     className="bg-primary hover:bg-primary/90 text-white shadow-sm"
//                   >
//                     Add Course
//                   </Button>
//                 </div>
//               </CardHeader>
//               <CardContent className="pt-6">
//                 {courses.length === 0 ? (
//                   <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
//                     <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
//                     <h3 className="text-lg font-medium text-slate-700 mb-2">
//                       No courses available
//                     </h3>
//                     <p className="text-slate-500 max-w-md mx-auto mb-6">
//                       You haven't created any courses yet. Add your first course
//                       to start building your catalog.
//                     </p>
//                     <Button
//                       onClick={() => setAddModalOpen(true)}
//                       variant="outline"
//                       className="border-primary text-primary hover:bg-primary/5"
//                     >
//                       Create Your First Course
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {courses.map((course) => (
//                       <Card
//                         key={course._id}
//                         className="overflow-hidden transition-all duration-300 hover:shadow-lg border border-slate-200 h-full flex flex-col"
//                       >
//                         <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
//                           {course.thumbnail ? (
//                             <img
//                               src={course.thumbnail || "/placeholder.svg"}
//                               alt={course.title}
//                               className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
//                             />
//                           ) : (
//                             <div className="w-full h-full flex items-center justify-center bg-slate-200">
//                               <BookOpen className="h-12 w-12 text-slate-400" />
//                             </div>
//                           )}
//                           <div className="absolute top-3 right-3 flex gap-2">
//                             <Badge
//                               className={getDifficultyColor(course.difficulty)}
//                             >
//                               {course.difficulty}
//                             </Badge>
//                           </div>
//                         </div>
//                         <CardHeader className="pb-2">
//                           <CardTitle className="text-xl font-bold line-clamp-1">
//                             {course.title}
//                           </CardTitle>
//                           <CardDescription className="line-clamp-2">
//                             {course.tagline}
//                           </CardDescription>
//                         </CardHeader>
//                         <CardContent className="pb-2 flex-grow">
//                           <div className="space-y-4">
//                             <div className="grid grid-cols-2 gap-2 text-sm">
//                               <div className="flex items-center gap-1.5 text-slate-600">
//                                 <Tag className="h-4 w-4" />
//                                 <span>{course.category}</span>
//                               </div>
//                               <div className="flex items-center gap-1.5 text-slate-600">
//                                 <DollarSign className="h-4 w-4" />
//                                 <span className="font-medium">
//                                   ${course.price}
//                                 </span>
//                               </div>
//                             </div>
//                             <Separator />
//                             <p className="text-sm text-slate-600 line-clamp-3">
//                               {course.about}
//                             </p>
//                           </div>
//                         </CardContent>
//                         <CardFooter className="pt-2 flex flex-col gap-2">
//                           <div className="flex justify-between w-full gap-2">
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="flex-1 border-slate-300 hover:bg-slate-50"
//                               onClick={() => {
//                                 setSelectedCourse(course);
//                                 setEditModalOpen(true);
//                               }}
//                             >
//                               <Pencil className="h-4 w-4 mr-2" />
//                               Edit
//                             </Button>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
//                               onClick={() => handleDeleteCourse(course._id)}
//                             >
//                               <Trash2 className="h-4 w-4 mr-2" />
//                               Delete
//                             </Button>
//                           </div>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
//                             onClick={() => {
//                               setSelectedCourse(course);
//                               fetchLessons(course._id);
//                               setLessonModalOpen(true);
//                             }}
//                           >
//                             <PlusCircle className="h-4 w-4 mr-2" />
//                             Manage Lessons
//                           </Button>
//                         </CardFooter>
//                       </Card>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//             {/* Lesson Management Modal */}
//             {lessonModalOpen && selectedCourse && (
//               <Dialog open={lessonModalOpen} onOpenChange={setLessonModalOpen}>
//                 <DialogContent className="sm:max-w-[600px] w-full">
//                   <DialogHeader>
//                     <DialogTitle>
//                       Manage Lessons for {selectedCourse.title}
//                     </DialogTitle>
//                   </DialogHeader>
//                   <div className="space-y-4">
//                     <Button
//                       onClick={() => setAddLessonModalOpen(true)}
//                       className="w-full bg-primary hover:bg-primary/90 text-white"
//                     >
//                       <PlusCircle className="h-4 w-4 mr-2" />
//                       Add New Lesson
//                     </Button>
//                     {lessons.length === 0 ? (
//                       <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
//                         <Video className="h-12 w-12 text-slate-300 mx-auto mb-4" />
//                         <p className="text-slate-500">No lessons added yet.</p>
//                       </div>
//                     ) : (
//                       <div className="space-y-4 max-h-[300px] overflow-y-auto">
//                         {lessons.map((lesson) => (
//                           <div
//                             key={lesson._id}
//                             className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
//                           >
//                             <div className="flex items-center gap-3">
//                               <Video className="h-5 w-5 text-primary" />
//                               <div>
//                                 <p className="text-sm font-medium">
//                                   {lesson.title}
//                                 </p>
//                                 <p className="text-xs text-muted-foreground">
//                                   {lesson.duration
//                                     ? `${lesson.duration} min`
//                                     : "No duration"}
//                                 </p>
//                               </div>
//                             </div>
//                             <Button variant="ghost" size="sm">
//                               <Trash2 className="h-4 w-4 text-rose-600" />
//                             </Button>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </DialogContent>
//               </Dialog>
//             )}
//             {/* Course and Lesson Modals */}
//             <CourseFormModal
//               open={addModalOpen}
//               onOpenChange={setAddModalOpen}
//               onCourseSaved={fetchCourses}
//             />
//             <CourseFormModal
//               open={editModalOpen}
//               onOpenChange={setEditModalOpen}
//               course={selectedCourse}
//               onCourseSaved={fetchCourses}
//               isEditMode={true}
//             />
//             {addLessonModalOpen && selectedCourse && (
//               <LessonFormModal
//                 open={addLessonModalOpen}
//                 onOpenChange={setAddLessonModalOpen}
//                 courseId={selectedCourse._id}
//                 onLessonSaved={() => fetchLessons(selectedCourse._id)}
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
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
  Pencil,
  Trash2,
  BookOpen,
  Tag,
  DollarSign,
  PlusCircle,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "./components/Header";
import { SideBar } from "./components/SideBar";

export function TutorCourses() {
  const [courses, setCourses] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [addLessonModalOpen, setAddLessonModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await authAxiosInstance.get("/courses/my-courses");
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast.error("Failed to load courses");
    }
  };

  const fetchLessons = async (courseId) => {
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

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const response = await authAxiosInstance.delete(
        `/courses/delete/${courseId}`
      );
      setCourses(courses.filter((course) => course._id !== courseId));
      toast.success(response.data.message);
    } catch (error) {
      console.error("Failed to delete course:", error);
      toast.error("Failed to delete course");
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

  const CourseFormModal = ({
    open,
    onOpenChange,
    course,
    onCourseSaved,
    isEditMode = false,
  }) => {
    const [title, setTitle] = useState(course?.title || "");
    const [tagline, setTagline] = useState(course?.tagline || "");
    const [category, setCategory] = useState(course?.category || "");
    const [difficulty, setDifficulty] = useState(course?.difficulty || "");
    const [price, setPrice] = useState(course?.price?.toString() || "");
    const [about, setAbout] = useState(course?.about || "");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // Use course.thumbnail (consistent with course card) instead of thumbnailUrl
    const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<
      string | null
    >(course?.thumbnail || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        setExistingThumbnailUrl(null); // Clear existing URL when a new file is selected
        toast.success("Thumbnail selected successfully");
      }
    };

    const triggerFileInput = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const removeFile = () => {
      setSelectedFile(null);
      setExistingThumbnailUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSave = async () => {
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
        formData.append("thumbnail", selectedFile); // Only append if a new file is selected
      }

      try {
        console.log("ISEDITMODE", isEditMode);
        console.log("COURSE ID", course?._id);
        if (isEditMode && course?._id) {
          const response = await authAxiosInstance.put(
            `/courses/update/${course._id}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          toast.success(response.data.message);
        } else {
          await authAxiosInstance.post("/courses/add", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Course added successfully!");
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
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] w-full">
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tag Line</Label>
              <Input
                id="tagline"
                placeholder="e.g., Master React in 30 Days"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
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
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
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
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="text"
                placeholder="e.g., 49.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
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
                          {existingThumbnailUrl.split("/").pop() ||
                            "Current Thumbnail"}
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
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSave}>
                {isEditMode ? "Save" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const LessonFormModal = ({ open, onOpenChange, courseId, onLessonSaved }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [duration, setDuration] = useState("");
    const [order, setOrder] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        if (selectedFile.size > 10 * 1024 * 1024) {
          toast.error("Lesson file size should not exceed 10MB");
          return;
        }
        if (!["video/mp4", "video/webm"].includes(selectedFile.type)) {
          toast.error("Only MP4 and WebM files are allowed");
          return;
        }
        setFile(selectedFile);
        toast.success("Lesson file selected successfully");
      }
    };

    const triggerFileInput = () => {
      if (fileInputRef.current) fileInputRef.current.click();
    };

    const removeFile = () => {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSaveLesson = async () => {
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

      try {
        await authAxiosInstance.post("/lessons/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Lesson added successfully!");
        onOpenChange(false);
        onLessonSaved();
        setTitle("");
        setDescription("");
        setFile(null);
        setDuration("");
        setOrder("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        console.error("Failed to add lesson:", error);
        toast.error("Failed to add lesson");
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] w-full">
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
                          MP4 or WebM (max 10MB)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {file && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                  >
                    <XIcon className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-duration">Duration (minutes)</Label>
              <Input
                id="lesson-duration"
                type="number"
                placeholder="e.g., 15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-order">Order</Label>
              <Input
                id="lesson-order"
                type="number"
                placeholder="e.g., 1"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveLesson}>
                Add Lesson
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col w-full">
      <Header />
      <div className="flex flex-col md:flex-row gap-6 p-6 w-full">
        <div className="w-full md:w-64 flex-shrink-0">
          <SideBar sidebarOpen={true} />
        </div>
        <div className="flex-1 w-full">
          <div className="space-y-8">
            <Card className="border-0 shadow-md w-full">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
                <div className="flex justify-between items-center flex-col sm:flex-row gap-4 sm:gap-0">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-800">
                      Manage Courses
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Create, edit, and manage your course catalog
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setAddModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-white shadow-sm"
                  >
                    Add Course
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {courses.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">
                      No courses available
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                      You haven’t created any courses yet. Add your first course
                      to start building your catalog.
                    </p>
                    <Button
                      onClick={() => setAddModalOpen(true)}
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/5"
                    >
                      Create Your First Course
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <Card
                        key={course._id}
                        className="overflow-hidden transition-all duration-300 hover:shadow-lg border border-slate-200 h-full flex flex-col"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail || "/placeholder.svg"}
                              alt={course.title}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
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
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Tag className="h-4 w-4" />
                                <span>{course.category}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <DollarSign className="h-4 w-4" />
                                <span className="font-medium">
                                  ${course.price}
                                </span>
                              </div>
                            </div>
                            <Separator />
                            <p className="text-sm text-slate-600 line-clamp-3">
                              {course.about}
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2 flex flex-col gap-2">
                          <div className="flex justify-between w-full gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-slate-300 hover:bg-slate-50"
                              onClick={() => {
                                setSelectedCourse(course);
                                setEditModalOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              onClick={() => handleDeleteCourse(course._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => {
                              setSelectedCourse(course);
                              fetchLessons(course._id);
                              setLessonModalOpen(true);
                            }}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Manage Lessons
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Lesson Management Modal */}
            {lessonModalOpen && selectedCourse && (
              <Dialog open={lessonModalOpen} onOpenChange={setLessonModalOpen}>
                <DialogContent className="sm:max-w-[600px] w-full">
                  <DialogHeader>
                    <DialogTitle>
                      Manage Lessons for {selectedCourse.title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Button
                      onClick={() => setAddLessonModalOpen(true)}
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add New Lesson
                    </Button>
                    {lessons.length === 0 ? (
                      <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <Video className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No lessons added yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[300px] overflow-y-auto">
                        {lessons.map((lesson) => (
                          <div
                            key={lesson._id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Video className="h-5 w-5 text-primary" />
                              <div>
                                <p className="text-sm font-medium">
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {lesson.duration
                                    ? `${lesson.duration} min`
                                    : "No duration"}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-rose-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {/* Course and Lesson Modals */}
            <CourseFormModal
              open={addModalOpen}
              onOpenChange={setAddModalOpen}
              onCourseSaved={fetchCourses}
            />
            <CourseFormModal
              open={editModalOpen}
              onOpenChange={setEditModalOpen}
              course={selectedCourse}
              onCourseSaved={fetchCourses}
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
          </div>
        </div>
      </div>
    </div>
  );
}