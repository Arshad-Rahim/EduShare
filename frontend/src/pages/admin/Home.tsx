"use client";

import { useState } from "react";
import {
 
  Users,
  Layers,

  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Table,
  Badge,
  CheckCircle2,
  XCircle,
  Clock,
  MoreHorizontal,
  PauseCircle,
  Ban,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "./components/admin/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@radix-ui/react-separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { SideBar } from "./components/admin/SideBar";

export function AdminHome() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <Header setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } fixed inset-y-0 left-0 top-16 z-30 w-64 shrink-0 border-r bg-background pt-4 md:block`}
        >
          <SideBar />
        </aside>

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? "md:ml-64" : ""}`}>
          <div className="container py-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Platform Dashboard</h1>
              <p className="text-muted-foreground">
                Overview and management of the TechLearn platform.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Total Users",
                  value: "24,827",
                  change: "+342",
                  changePercent: "+12.3%",
                  status: "increase",
                  icon: <Users className="h-5 w-5" />,
                },
                {
                  title: "Active Courses",
                  value: "432",
                  change: "+28",
                  changePercent: "+6.4%",
                  status: "increase",
                  icon: <Layers className="h-5 w-5" />,
                },
                {
                  title: "Total Revenue",
                  value: "$628,540",
                  change: "$48,230",
                  changePercent: "+15.9%",
                  status: "increase",
                  icon: <DollarSign className="h-5 w-5" />,
                },
                {
                  title: "Avg. Completion Rate",
                  value: "68.5%",
                  change: "-2.4%",
                  changePercent: "-2.4%",
                  status: "decrease",
                  icon: <Percent className="h-5 w-5" />,
                },
              ].map((stat, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="rounded-full bg-primary/10 p-2">
                        {stat.icon}
                      </div>
                      <span
                        className={
                          stat.status === "increase"
                            ? "flex items-center text-sm font-medium text-green-500"
                            : "flex items-center text-sm font-medium text-red-500"
                        }
                      >
                        {stat.status === "increase" ? (
                          <ArrowUpRight className="mr-1 h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="mr-1 h-4 w-4" />
                        )}
                        {stat.changePercent}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {stat.status === "increase" ? "+" : ""}
                        {stat.change} this month
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* User Management */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage all users on the platform
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="students">Students</SelectItem>
                        <SelectItem value="tutors">Tutors</SelectItem>
                        <SelectItem value="admins">Administrators</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        name: "John Smith",
                        email: "john.smith@example.com",
                        role: "Student",
                        status: "Active",
                        joined: "Mar 12, 2023",
                        lastLogin: "Today, 2:45 PM",
                        avatar: "/placeholder.svg?height=40&width=40&text=JS",
                      },
                      {
                        name: "Dr. Sarah Johnson",
                        email: "sarah.j@example.com",
                        role: "Tutor",
                        status: "Active",
                        joined: "Jan 05, 2022",
                        lastLogin: "Yesterday, 8:12 AM",
                        avatar: "/placeholder.svg?height=40&width=40&text=SJ",
                      },
                      {
                        name: "Michael Brown",
                        email: "m.brown@example.com",
                        role: "Student",
                        status: "Inactive",
                        joined: "Jun 18, 2023",
                        lastLogin: "Mar 08, 2023, 11:30 AM",
                        avatar: "/placeholder.svg?height=40&width=40&text=MB",
                      },
                      {
                        name: "Emma Wilson",
                        email: "emma.w@example.com",
                        role: "Admin",
                        status: "Active",
                        joined: "Nov 30, 2021",
                        lastLogin: "Today, 9:05 AM",
                        avatar: "/placeholder.svg?height=40&width=40&text=EW",
                      },
                      {
                        name: "David Chen",
                        email: "dchen@example.com",
                        role: "Tutor",
                        status: "Pending",
                        joined: "Apr 02, 2023",
                        lastLogin: "Apr 02, 2023, 3:40 PM",
                        avatar: "/placeholder.svg?height=40&width=40&text=DC",
                      },
                    ].map((user, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.role === "Admin"
                                ? "border-purple-200 bg-purple-50"
                                : user.role === "Tutor"
                                ? "border-blue-200 bg-blue-50"
                                : "border-green-200 bg-green-50"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {user.status === "Active" && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            {user.status === "Inactive" && (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            {user.status === "Pending" && (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                            <span
                              className={
                                user.status === "Active"
                                  ? "text-green-600"
                                  : user.status === "Inactive"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                              }
                            >
                              {user.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{user.joined}</TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Edit User</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                Suspend User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing 5 of 24,827 users
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Course Management and Analytics */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Course Status</CardTitle>
                  <CardDescription>
                    Overview of all courses on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        title: "Active",
                        value: 342,
                        icon: (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ),
                        color: "bg-green-50 border-green-200",
                      },
                      {
                        title: "Pending Review",
                        value: 54,
                        icon: <Clock className="h-5 w-5 text-yellow-500" />,
                        color: "bg-yellow-50 border-yellow-200",
                      },
                      {
                        title: "Paused",
                        value: 28,
                        icon: <PauseCircle className="h-5 w-5 text-blue-500" />,
                        color: "bg-blue-50 border-blue-200",
                      },
                      {
                        title: "Rejected",
                        value: 12,
                        icon: <Ban className="h-5 w-5 text-red-500" />,
                        color: "bg-red-50 border-red-200",
                      },
                    ].map((status, index) => (
                      <Card key={index} className={`border ${status.color}`}>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                          {status.icon}
                          <p className="mt-2 text-2xl font-bold">
                            {status.value}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {status.title}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Separator className="my-6" />
                  <div className="space-y-3">
                    <h4 className="font-medium">Recent Course Submissions</h4>
                    {[
                      {
                        title: "Advanced Cybersecurity Fundamentals",
                        author: "Michael Chen",
                        submitted: "2 hours ago",
                        status: "Pending Review",
                      },
                      {
                        title: "Cloud Infrastructure Design Patterns",
                        author: "Sophia Rodriguez",
                        submitted: "Yesterday",
                        status: "Pending Review",
                      },
                      {
                        title: "Mobile App Development with React Native",
                        author: "David Smith",
                        submitted: "2 days ago",
                        status: "Pending Review",
                      },
                    ].map((course, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-muted-foreground">
                            By {course.author} • {course.submitted}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 border-yellow-200"
                          >
                            {course.status}
                          </Badge>
                          <Button size="sm">Review</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Metrics</CardTitle>
                  <CardDescription>
                    Platform analytics and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="enrollment">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
                      <TabsTrigger value="revenue">Revenue</TabsTrigger>
                      <TabsTrigger value="retention">Retention</TabsTrigger>
                    </TabsList>
                    <TabsContent value="enrollment" className="pt-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-2xl font-bold">8,274</div>
                          <div className="text-sm text-muted-foreground">
                            New enrollments this month
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          <span className="flex items-center">
                            <ArrowUpRight className="mr-1 h-4 w-4" />
                            +24.5% vs last month
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 h-[160px] rounded-md bg-muted/50 flex items-center justify-center">
                        <div className="text-muted-foreground">
                          Enrollment chart placeholder
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium">Top Categories</h4>
                        {[
                          {
                            name: "Web Development",
                            growth: "+18%",
                            value: "34%",
                          },
                          {
                            name: "Data Science & AI",
                            growth: "+32%",
                            value: "28%",
                          },
                          {
                            name: "Cloud Computing",
                            growth: "+12%",
                            value: "15%",
                          },
                        ].map((category, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="text-sm">{category.name}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-green-600">
                                {category.growth}
                              </span>
                              <span className="text-sm font-medium">
                                {category.value}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="revenue" className="pt-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-2xl font-bold">$238,492</div>
                          <div className="text-sm text-muted-foreground">
                            Revenue this month
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          <span className="flex items-center">
                            <ArrowUpRight className="mr-1 h-4 w-4" />
                            +16.8% vs last month
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 h-[160px] rounded-md bg-muted/50 flex items-center justify-center">
                        <div className="text-muted-foreground">
                          Revenue chart placeholder
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="retention" className="pt-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-2xl font-bold">76.4%</div>
                          <div className="text-sm text-muted-foreground">
                            30-day retention rate
                          </div>
                        </div>
                        <div className="text-sm font-medium text-red-600">
                          <span className="flex items-center">
                            <ArrowDownRight className="mr-1 h-4 w-4" />
                            -2.3% vs last month
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 h-[160px] rounded-md bg-muted/50 flex items-center justify-center">
                        <div className="text-muted-foreground">
                          Retention chart placeholder
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Detailed Analytics
                    <ChevronRight className="ml-2 h-4 w-4" />
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
