"use client";

import { useState } from "react";
import {Link} from "react-router-dom";
import {
  BookOpen,
  Code,
  Database,
  Globe,
  Menu,
  Search,
  Server,
  Star,
  X,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export  function UserHomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">LearnHub</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:gap-6">
            <Link to="#" className="text-sm font-medium text-primary">
              Home
            </Link>
            <Link
              to="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Courses
            </Link>
            <Link
              to="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Paths
            </Link>
            <Link
              to="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Community
            </Link>
            <Link
              to="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <form className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="w-[200px] pl-8 md:w-[250px] lg:w-[300px]"
                />
              </div>
            </form>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden md:inline-flex"
            >
              <Link to="/auth">Log in</Link>
            </Button>
            <Button size="sm" asChild className="hidden md:inline-flex">
              <Link to="/auth">Sign up</Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">LearnHub</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <nav className="container grid gap-6 py-6">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="w-full pl-8"
                />
              </div>
            </form>
            <Link to="#" className="text-lg font-medium text-primary">
              Home
            </Link>
            <Link
              to="#"
              className="text-lg font-medium text-muted-foreground"
            >
              Courses
            </Link>
            <Link
              to="#"
              className="text-lg font-medium text-muted-foreground"
            >
              Paths
            </Link>
            <Link
              to="#"
              className="text-lg font-medium text-muted-foreground"
            >
              Community
            </Link>
            <Link
              to="#"
              className="text-lg font-medium text-muted-foreground"
            >
              About
            </Link>
            <Separator />
            <div className="flex flex-col gap-4">
              <Button variant="outline" asChild className="w-full">
                <Link to="#">Log in</Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="#">Sign up</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-12 md:py-24">
          <div className="container flex flex-col items-center gap-6 text-center">
            <Badge variant="outline" className="px-3.5 py-1.5 text-sm">
              Over 500+ courses available
            </Badge>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Learn the skills you need to{" "}
              <span className="text-primary">succeed</span>
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Access high-quality courses taught by industry experts. Start your
              learning journey today.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="#">Browse Courses</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="#">View Learning Paths</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 md:py-24">
          <div className="container">
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Explore Categories
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Discover courses in the most in-demand tech fields
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Web Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Learn HTML, CSS, JavaScript, React, and more to build modern
                    websites.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="#">Explore 120+ courses</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Data Science</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Master Python, SQL, machine learning, and data
                    visualization.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="#">Explore 85+ courses</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Server className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Cloud Computing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Learn AWS, Azure, Google Cloud, and DevOps practices.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="#">Explore 70+ courses</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Mobile Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Build apps for iOS and Android with React Native and
                    Flutter.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="#">Explore 65+ courses</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section className="bg-muted/50 py-12 md:py-24">
          <div className="container">
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Featured Courses
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Our most popular and highly-rated courses
              </p>
            </div>

            <Tabs defaultValue="popular" className="mt-12">
              <div className="flex justify-center">
                <TabsList>
                  <TabsTrigger value="popular">Most Popular</TabsTrigger>
                  <TabsTrigger value="new">New Releases</TabsTrigger>
                  <TabsTrigger value="trending">Trending</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="popular" className="mt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      title: "Complete Web Development Bootcamp",
                      description:
                        "Learn full-stack web development from scratch",
                      image: "/placeholder.svg?height=200&width=300",
                      instructor: "Sarah Johnson",
                      rating: 4.9,
                      reviews: 2453,
                      price: "$89.99",
                      level: "Beginner",
                      duration: "48 hours",
                    },
                    {
                      title: "Advanced React & Redux",
                      description:
                        "Master modern React patterns and state management",
                      image: "/placeholder.svg?height=200&width=300",
                      instructor: "Michael Chen",
                      rating: 4.8,
                      reviews: 1872,
                      price: "$94.99",
                      level: "Intermediate",
                      duration: "36 hours",
                    },
                    {
                      title: "Python for Data Science & Machine Learning",
                      description:
                        "Comprehensive guide to data analysis with Python",
                      image: "/placeholder.svg?height=200&width=300",
                      instructor: "Emily Rodriguez",
                      rating: 4.9,
                      reviews: 3241,
                      price: "$99.99",
                      level: "All Levels",
                      duration: "52 hours",
                    },
                  ].map((course, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden transition-all hover:shadow-md"
                    >
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={"/vite.svg"|| "/placeholder.svg"}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{course.level}</Badge>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="font-medium">{course.rating}</span>
                            <span className="text-muted-foreground">
                              ({course.reviews})
                            </span>
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {course.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {course.instructor.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {course.instructor}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {course.duration}
                          </div>
                          <div className="font-bold">{course.price}</div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">Enroll Now</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="new" className="mt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Similar structure as above with different courses */}
                  <Card className="overflow-hidden transition-all hover:shadow-md">
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src="/placeholder.svg?height=200&width=300"
                        alt="Next.js 14 Masterclass"
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Intermediate</Badge>
                        <Badge variant="secondary">NEW</Badge>
                      </div>
                      <CardTitle className="line-clamp-2">
                        Next.js 14 Masterclass
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        Build modern web applications with the latest Next.js
                        features
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>J</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          Jason Miller
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          32 hours
                        </div>
                        <div className="font-bold">$79.99</div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Enroll Now</Button>
                    </CardFooter>
                  </Card>

                  {/* Add more new courses here */}
                </div>
              </TabsContent>

              <TabsContent value="trending" className="mt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Similar structure as above with different courses */}
                  <Card className="overflow-hidden transition-all hover:shadow-md">
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src="/placeholder.svg?height=200&width=300"
                        alt="AI Development with Python"
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Advanced</Badge>
                        <Badge variant="secondary">TRENDING</Badge>
                      </div>
                      <CardTitle className="line-clamp-2">
                        AI Development with Python
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        Learn to build and deploy AI models using Python and
                        TensorFlow
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">Alex Kumar</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          45 hours
                        </div>
                        <div className="font-bold">$129.99</div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Enroll Now</Button>
                    </CardFooter>
                  </Card>

                  {/* Add more trending courses here */}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-12 flex justify-center">
              <Button size="lg" variant="outline" asChild>
                <Link to="#">View All Courses</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 md:py-24">
          <div className="container">
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                What Our Students Say
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Hear from our community of learners
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "David Wilson",
                  role: "Software Engineer",
                  company: "TechCorp",
                  testimonial:
                    "The web development courses on LearnHub helped me transition from a junior to a senior developer in just 8 months. The instructors are amazing and the content is always up-to-date.",
                  avatar: "/placeholder.svg?height=100&width=100",
                },
                {
                  name: "Priya Sharma",
                  role: "Data Scientist",
                  company: "DataInsights",
                  testimonial:
                    "I started with zero knowledge in data science and now I'm working at my dream company. The Python for Data Science course was comprehensive and practical.",
                  avatar: "/placeholder.svg?height=100&width=100",
                },
                {
                  name: "Marcus Johnson",
                  role: "Frontend Developer",
                  company: "CreativeAgency",
                  testimonial:
                    "The React courses are exceptional. I've tried many platforms, but LearnHub's project-based approach and community support made all the difference in my learning journey.",
                  avatar: "/placeholder.svg?height=100&width=100",
                },
              ].map((testimonial, index) => (
                <Card key={index} className="transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={testimonial.avatar}
                          alt={testimonial.name}
                        />
                        <AvatarFallback>
                          {testimonial.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {testimonial.name}
                        </CardTitle>
                        <CardDescription>
                          {testimonial.role} at {testimonial.company}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      "{testimonial.testimonial}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-12 md:py-24">
          <div className="container flex flex-col items-center gap-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Start Learning?
            </h2>
            <p className="max-w-[700px] md:text-xl">
              Join thousands of students already learning on LearnHub
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link to="#">Sign Up for Free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="#">Explore Courses</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">LearnHub</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Empowering learners worldwide with high-quality tech education.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Courses</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Web Development
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Data Science
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cloud Computing
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Mobile Development
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    DevOps
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Company</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Press
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2025 LearnHub. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                to="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">Twitter</span>
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
              </Link>
              <Link
                to="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">LinkedIn</span>
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
              </Link>
              <Link
                to="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">GitHub</span>
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
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
              </Link>
              <Link
                to="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">YouTube</span>
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
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                  <path d="m10 15 5-3-5-3z"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
