'use client';

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { authAxiosInstance } from '@/api/authAxiosInstance';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { removeUser } from '@/redux/slice/userSlice';

// Styled Header Component
function Header() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    authAxiosInstance
      .get('/users/me')
      .then((response) => {
        console.log('RESPONSE IN FRONTEND', response);
        setUser({
          name: response.data.users.name,
          email: response.data.users.email,
        });
      })
      .catch((error) => {
        console.error('Failed to fetch user:', error);
      });
  }, []);

  const handleLogout = () => {
    authAxiosInstance
      .post('/auth/logout')
      .then((response) => {
        console.log(response);
        toast.success(response.data.message);
        localStorage.removeItem('userData');
        dispatch(removeUser());
        navigate('/auth');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
        toast.error('Failed to sign out');
      });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">LearnHub</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:gap-6">
          <Link to="/" className="text-sm font-medium text-primary">
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

        {/* Right Section */}
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

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 hover:bg-muted/50"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32&text=U"
                      alt={user.name}
                    />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-start text-sm md:flex">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-md border bg-background p-1 shadow-lg"
              >
                <DropdownMenuLabel className="px-2 py-1.5">
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 h-px bg-muted" />
                <DropdownMenuItem
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer px-2 py-1.5 text-sm hover:bg-muted focus:outline-none"
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer px-2 py-1.5 text-sm text-destructive hover:bg-muted focus:outline-none"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
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
            </>
          )}

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
  );
}

// Main UserHomePage Component
export function UserHomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const dispatch = useDispatch();

  useEffect(() => {
    function fetchUser() {
      authAxiosInstance
        .get('/users/me')
        .then((response) => {
          console.log('RESPONSE IN FRONTEND', response);
          setUser({
            name: response.data.users.name,
            email: response.data.users.email,
          });
        })
        .catch((error) => {
          console.error('Failed to fetch user:', error);
        });
    }
    fetchUser();
  }, []);

  const handleLogout = () => {
    authAxiosInstance
      .post('/auth/logout')
      .then((response) => {
        console.log(response);
        setUser(null);
        localStorage.removeItem('userData');
        dispatch(removeUser());
        toast.success('Signed out successfully');
        navigate('/auth');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
        toast.error('Failed to sign out');
      });
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Integrated Header */}
      <Header />

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
            <Link to="/" className="text-lg font-medium text-primary">
              Home
            </Link>
            <Link to="#" className="text-lg font-medium text-muted-foreground">
              Courses
            </Link>
            <Link to="#" className="text-lg font-medium text-muted-foreground">
              Paths
            </Link>
            <Link to="#" className="text-lg font-medium text-muted-foreground">
              Community
            </Link>
            <Link to="#" className="text-lg font-medium text-muted-foreground">
              About
            </Link>
            <Separator />
            {user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-lg font-medium">{user.name}</span>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/profile">Profile</Link>
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/auth">Log in</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/auth">Sign up</Link>
                </Button>
              </div>
            )}
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
              Learn the skills you need to{' '}
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
                      title: 'Complete Web Development Bootcamp',
                      description:
                        'Learn full-stack web development from scratch',
                      image: '/placeholder.svg?height=200&width=300',
                      instructor: 'Sarah Johnson',
                      rating: 4.9,
                      reviews: 2453,
                      price: '$89.99',
                      level: 'Beginner',
                      duration: '48 hours',
                    },
                    {
                      title: 'Advanced React & Redux',
                      description:
                        'Master modern React patterns and state management',
                      image: '/placeholder.svg?height=200&width=300',
                      instructor: 'Michael Chen',
                      rating: 4.8,
                      reviews: 1872,
                      price: '$94.99',
                      level: 'Intermediate',
                      duration: '36 hours',
                    },
                    {
                      title: 'Python for Data Science & Machine Learning',
                      description:
                        'Comprehensive guide to data analysis with Python',
                      image: '/placeholder.svg?height=200&width=300',
                      instructor: 'Emily Rodriguez',
                      rating: 4.9,
                      reviews: 3241,
                      price: '$99.99',
                      level: 'All Levels',
                      duration: '52 hours',
                    },
                  ].map((course, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden transition-all hover:shadow-md"
                    >
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={course.image}
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
                </div>
              </TabsContent>

              <TabsContent value="trending" className="mt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  name: 'David Wilson',
                  role: 'Software Engineer',
                  company: 'TechCorp',
                  testimonial:
                    'The web development courses on LearnHub helped me transition from a junior to a senior developer in just 8 months.',
                  avatar: '/placeholder.svg?height=100&width=100',
                },
                {
                  name: 'Priya Sharma',
                  role: 'Data Scientist',
                  company: 'DataInsights',
                  testimonial:
                    'I started with zero knowledge in data science and now I\'m working at my dream company.',
                  avatar: '/placeholder.svg?height=100&width=100',
                },
                {
                  name: 'Marcus Johnson',
                  role: 'Frontend Developer',
                  company: 'CreativeAgency',
                  testimonial:
                    'The React courses are exceptional. The project-based approach made all the difference.',
                  avatar: '/placeholder.svg?height=100&width=100',
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
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2025 LearnHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
