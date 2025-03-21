"use client";

import { useState } from "react";
import {
  BookOpen,
  BarChart3,
  Users,
  Video,
  FileText,
  Film,
  Bell,
  Settings,
  LayoutDashboard,
  MessageSquare,
  Calendar,
  HelpCircle,
  Menu,
  ChevronDown,
  Plus,
  Clock,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Activity,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeUser } from "@/redux/slice/userSlice";
import { toast } from "sonner";

export function TutorHome() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = () => {
    authAxiosInstance
      .post("/logout")
      .then((response) => {
        console.log(response);
        toast.success(response.data.message);

        localStorage.removeItem("userData");
        dispatch(removeUser());
        navigate("/auth");
      })
      .catch((error) => {
        console.error("Logout failed:", error);
      });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between space-x-4 sm:space-x-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">TechLearn</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32&text=T"
                      alt="@tutor"
                    />
                    <AvatarFallback>T</AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-start text-sm md:flex">
                    <span>Dr. Ryan Miller</span>
                    <span className="text-xs text-muted-foreground">Tutor</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Earnings</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    handleSignOut();
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } fixed inset-y-0 left-0 top-16 z-30 w-64 shrink-0 border-r bg-background pt-4 md:block`}
        >
          <div className="flex h-full flex-col">
            <div className="px-4">
              <Button className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                Create New Course
              </Button>
            </div>
            <nav className="mt-6 grid gap-1 px-2">
              {[
                {
                  icon: <LayoutDashboard className="h-4 w-4" />,
                  name: "Dashboard",
                  active: true,
                },
                { icon: <FileText className="h-4 w-4" />, name: "My Courses" },
                {
                  icon: <Video className="h-4 w-4" />,
                  name: "Content Creation",
                },
                { icon: <Users className="h-4 w-4" />, name: "Students" },
                {
                  icon: <MessageSquare className="h-4 w-4" />,
                  name: "Messages",
                },
                { icon: <BarChart3 className="h-4 w-4" />, name: "Analytics" },
                { icon: <Calendar className="h-4 w-4" />, name: "Schedule" },
              ].map((item) => (
                <Button
                  key={item.name}
                  variant={item.active ? "secondary" : "ghost"}
                  className="justify-start"
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Button>
              ))}
            </nav>
            <div className="mt-auto border-t px-4 py-4">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? "md:ml-64" : ""}`}>
          <div className="container py-6">
            <div className="mb-10">
              <h1 className="text-3xl font-bold">Welcome back, Dr. Ryan</h1>
              <p className="text-muted-foreground">
                Here's what's happening with your courses today.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {[
                {
                  title: "Active Students",
                  value: "2,845",
                  change: "+12%",
                  status: "increase",
                  icon: <Users className="h-5 w-5" />,
                },
                {
                  title: "Course Completion",
                  value: "76%",
                  change: "+4%",
                  status: "increase",
                  icon: <CheckCircle2 className="h-5 w-5" />,
                },
                {
                  title: "Revenue (This Month)",
                  value: "$12,450",
                  change: "+18%",
                  status: "increase",
                  icon: <BarChart3 className="h-5 w-5" />,
                },
                {
                  title: "Average Rating",
                  value: "4.8/5",
                  change: "+0.3",
                  status: "increase",
                  icon: <Activity className="h-5 w-5" />,
                },
              ].map((stat, index) => (
                <Card key={index}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                      <div className="mt-1 flex items-center">
                        {stat.status === "increase" ? (
                          <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                          <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        <span
                          className={
                            stat.status === "increase"
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-full bg-primary/10 p-3">
                      {stat.icon}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Course Overview and Management */}
            <div className="mb-8 grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Course Performance</CardTitle>
                  <CardDescription>
                    Overview of your active courses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      {
                        title: "Advanced React Development",
                        students: 845,
                        completion: 82,
                        rating: 4.9,
                        revenue: "$5,230",
                        status: "Active",
                      },
                      {
                        title: "Node.js API Masterclass",
                        students: 632,
                        completion: 75,
                        rating: 4.7,
                        revenue: "$3,980",
                        status: "Active",
                      },
                      {
                        title: "Full Stack Web Development",
                        students: 1207,
                        completion: 68,
                        rating: 4.8,
                        revenue: "$8,740",
                        status: "Active",
                      },
                    ].map((course, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{course.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {course.status}
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                <span>{course.students} students</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BarChart3 className="h-3.5 w-3.5" />
                                <span>{course.revenue}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {course.rating}/5
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Rating
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {course.completion}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Completion
                              </div>
                            </div>
                          </div>
                        </div>
                        <Progress value={course.completion} className="h-2" />
                        {index < 2 && <Separator className="my-4" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Courses
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Student Activity</CardTitle>
                  <CardDescription>
                    Latest enrollments and completions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Emma Johnson",
                        action: "enrolled in",
                        course: "Advanced React Development",
                        time: "2 hours ago",
                        avatar: "/placeholder.svg?height=40&width=40&text=EJ",
                      },
                      {
                        name: "Michael Smith",
                        action: "completed",
                        course: "Node.js API Masterclass",
                        time: "5 hours ago",
                        avatar: "/placeholder.svg?height=40&width=40&text=MS",
                      },
                      {
                        name: "Sophia Chen",
                        action: "submitted assignment for",
                        course: "Full Stack Web Development",
                        time: "Yesterday",
                        avatar: "/placeholder.svg?height=40&width=40&text=SC",
                      },
                      {
                        name: "James Williams",
                        action: "asked a question in",
                        course: "Advanced React Development",
                        time: "Yesterday",
                        avatar: "/placeholder.svg?height=40&width=40&text=JW",
                      },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage
                            src={activity.avatar}
                            alt={activity.name}
                          />
                          <AvatarFallback>
                            {activity.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">{activity.name}</span>{" "}
                            {activity.action}{" "}
                            <span className="font-medium">
                              {activity.course}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Content Management & Upcoming Schedule */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Content Management</CardTitle>
                    <CardDescription>
                      Manage your course content
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Content
                  </Button>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="recent">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="recent">Recent</TabsTrigger>
                      <TabsTrigger value="drafts">Drafts</TabsTrigger>
                      <TabsTrigger value="pending">Pending Review</TabsTrigger>
                    </TabsList>
                    <TabsContent value="recent" className="pt-4">
                      <div className="space-y-4">
                        {[
                          {
                            title: "Introduction to React Hooks",
                            type: "Video",
                            course: "Advanced React Development",
                            updatedAt: "Today",
                            status: "Published",
                          },
                          {
                            title: "Building RESTful APIs with Express",
                            type: "Article",
                            course: "Node.js API Masterclass",
                            updatedAt: "Yesterday",
                            status: "Published",
                          },
                          {
                            title: "State Management with Redux",
                            type: "Quiz",
                            course: "Advanced React Development",
                            updatedAt: "3 days ago",
                            status: "Published",
                          },
                        ].map((content, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-3">
                              {content.type === "Video" && (
                                <Film className="h-5 w-5 text-blue-500" />
                              )}
                              {content.type === "Article" && (
                                <FileText className="h-5 w-5 text-green-500" />
                              )}
                              {content.type === "Quiz" && (
                                <FileText className="h-5 w-5 text-amber-500" />
                              )}
                              <div>
                                <p className="font-medium">{content.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {content.course}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="mr-1 h-3.5 w-3.5" />
                                {content.updatedAt}
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  content.status === "Published"
                                    ? "border-green-200 bg-green-50"
                                    : content.status === "Draft"
                                    ? "border-amber-200 bg-amber-50"
                                    : ""
                                }
                              >
                                {content.status}
                              </Badge>
                              <Button variant="ghost" size="icon">
                                <DropdownMenu>
                                  <DropdownMenuTrigger>
                                    <ChevronDown className="h-4 w-4" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Archive</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="drafts" className="pt-4">
                      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                        <div className="flex flex-col items-center text-center">
                          <FileText className="h-10 w-10 text-muted-foreground/70" />
                          <h3 className="mt-2 text-lg font-medium">
                            No drafts yet
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Start creating new content for your courses
                          </p>
                          <Button className="mt-4">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Content
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="pending" className="pt-4">
                      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                        <div className="flex flex-col items-center text-center">
                          <FileText className="h-10 w-10 text-muted-foreground/70" />
                          <h3 className="mt-2 text-lg font-medium">
                            No pending content
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            All your content has been reviewed
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Schedule</CardTitle>
                  <CardDescription>Your next 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Live Q&A Session",
                        course: "Advanced React Development",
                        time: "Today, 3:00 PM",
                        duration: "1 hour",
                        attendees: 34,
                      },
                      {
                        title: "Assignment Review",
                        course: "Node.js API Masterclass",
                        time: "Today, 5:30 PM",
                        duration: "1.5 hours",
                        attendees: 14,
                      },
                      {
                        title: "Code Review Session",
                        course: "Full Stack Web Development",
                        time: "Tomorrow, 10:00 AM",
                        duration: "2 hours",
                        attendees: 28,
                      },
                    ].map((event, index) => (
                      <div key={index} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge variant="outline" className="bg-primary/10">
                            {event.duration}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {event.course}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>{event.attendees} attendees</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Full Schedule
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
