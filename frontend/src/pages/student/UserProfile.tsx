import { useState, useEffect, useCallback, useMemo, memo } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  BookOpen,
  X,
  User,
  Edit,
  Save,
  Eye,
  EyeOff,
  Heart,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NewPasswordModal } from "@/components/modal-components/newPassword";
import { Header } from "./components/Header";
import { userAuthService } from "@/services/userService/authUser";
import { profileService } from "@/services/userService/profileService";

// Validation schema for profile form
const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .regex(/\S/, "Full name cannot be only whitespace")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Full name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  bio: z
    .string()
    .trim()
    .min(1, "Bio is required")
    .regex(/\S/, "Bio cannot be only whitespace"),
  interests: z
    .string()
    .trim()
    .min(1, "Interests are required")
    .regex(/\S/, "Interests cannot be only whitespace"),
  education: z
    .string()
    .trim()
    .min(1, "Education is required")
    .regex(/\S/, "Education cannot be only whitespace")
    .regex(
      /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.,-]+$/,
      "Education must contain at least one letter and can only include letters, numbers, spaces, commas, periods, and hyphens"
    ),
});

// Sidebar Component
const Sidebar = memo(() => {
  const sidebarUI = useMemo(
    () => (
      <div className="w-full space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Dashboard
          </h2>
          <div className="space-y-1">
            <Button variant="secondary" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/my-courses">
                <BookOpen className="mr-2 h-4 w-4" />
                My Courses
              </Link>
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Learning
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/courses">
                <BookOpen className="mr-2 h-4 w-4" />
                All Courses
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/wishlist">
                <Heart className="mr-2 h-4 w-4" />
                Wishlist
              </Link>
            </Button>
          </div>
        </div>
      </div>
    ),
    []
  );

  return sidebarUI;
});
Sidebar.displayName = "Sidebar";

// CurrentPasswordModal Component
const CurrentPasswordModal = memo(
  ({ onPasswordVerified }: { onPasswordVerified: () => void }) => {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);

    const formSchema = z.object({
      currentPassword: z
        .string()
        .min(1, { message: "Current password is required" }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        currentPassword: "",
      },
    });

    const verifyCurrentPassword = useCallback(
      async (password: string): Promise<boolean> => {
        try {
          const response = await userAuthService.verifyPassword(password);
          return response.data.valid || false;
        } catch (error) {
          console.error("Password verification failed:", error);
          return false;
        }
      },
      []
    );

    const onSubmit = useCallback(
      async (values: z.infer<typeof formSchema>) => {
        try {
          const isValid = await verifyCurrentPassword(values.currentPassword);
          if (isValid) {
            setError(null);
            setOpen(false);
            onPasswordVerified();
          } else {
            setError("Incorrect password. Please try again.");
          }
        } catch (err) {
          console.log(err);
          setError("An error occurred. Please try again later.");
        }
      },
      [onPasswordVerified, verifyCurrentPassword]
    );

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Change Password</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Verify Current Password</DialogTitle>
            <DialogDescription>
              Please enter your current password to proceed with changing it.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter your current password"
                          className="pr-10"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-gray-900"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showCurrentPassword
                            ? "Hide password"
                            : "Show password"}
                        </span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Verify</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
);
CurrentPasswordModal.displayName = "CurrentPasswordModal";

// Main StudentProfile Component
function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
    bio: "I'm a student passionate about learning new technologies and skills.",
    interests: "Web Development, Mobile Apps, Data Science",
    education: "Computer Science",
    password: null as string | null,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newPasswordModalOpen, setNewPasswordModalOpen] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "I'm a student passionate about learning new technologies and skills.",
      interests: "Web Development, Mobile Apps, Data Science",
      education: "Computer Science",
    },
  });

  const userData = useCallback(async () => {
    try {
      const response = await profileService.userDetails();
      const userData = response.data.users;
      const updatedUser = {
        name: userData.name,
        email: userData.email,
        bio:
          userData.aboutMe ||
          "I'm a student passionate about learning new technologies and skills.",
        interests:
          userData.interests || "Web Development, Mobile Apps, Data Science",
        education: userData.education || "Computer Science",
        password: userData.password,
      };
      setUser(updatedUser);
      form.reset({
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        interests: updatedUser.interests,
        education: updatedUser.education,
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      toast.error("Failed to load profile data");
    }
  }, [form]);

  useEffect(() => {
    userData();
  }, [userData]);

  const handleSave = useCallback(
    form.handleSubmit(async (data) => {
      try {
        const response = await profileService.profileUpdate(data);
        setUser({ ...data, password: user.password });
        setIsEditing(false);
        toast.success(response.data.message || "Profile updated successfully!");
      } catch (error) {
        console.error("Update failed:", error);
        toast.error("Failed to update profile!");
      }
    }),
    [form, user.password]
  );

  const handleCancel = useCallback(() => {
    form.reset(user);
    setIsEditing(false);
  }, [form, user]);

  const handlePasswordVerified = useCallback(() => {
    setNewPasswordModalOpen(true);
  }, []);

  const handlePasswordUpdated = useCallback(() => {
    console.log("Password updated successfully!");
  }, []);

  const mobileMenuUI = useMemo(
    () =>
      mobileMenuOpen ? (
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
              <X className="hbs-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <Sidebar />
        </div>
      ) : null,
    [mobileMenuOpen]
  );

  const interestsTags = useMemo(
    () =>
      user.interests.split(",").map((interest, index) => (
        <span
          key={index}
          className="inline-block bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2"
        >
          {interest.trim()}
        </span>
      )),
    [user.interests]
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      {mobileMenuUI}
      <div className="flex flex-col md:flex-row gap-6 p-6">
        <div className="w-full md:w-64 flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 max-w-4xl w-full">
          <Form {...form}>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Profile Overview Card */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Profile Overview</CardTitle>
                      <CardDescription>
                        Your personal profile information
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant={isEditing ? "outline" : "default"}
                      onClick={() =>
                        isEditing ? handleCancel() : setIsEditing(true)
                      }
                    >
                      {isEditing ? (
                        <>Cancel</>
                      ) : (
                        <>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src="/placeholder.svg?height=96&width=96"
                          alt={user.name}
                        />
                        <AvatarFallback className="text-2xl">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Full Name</FormLabel>
                              {isEditing ? (
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              ) : (
                                <div className="p-2 border rounded-md bg-muted/50">
                                  {user.name}
                                </div>
                              )}
                              {isEditing && <FormMessage />}
                            </FormItem>
                          )}
                        />
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="p-2 border rounded-md bg-muted/50">
                            {user.email}
                          </div>
                          {isEditing && (
                            <p className="text-xs text-muted-foreground">
                              Your email address cannot be changed
                            </p>
                          )}
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Education</FormLabel>
                            {isEditing ? (
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            ) : (
                              <div className="p-2 border rounded-md bg-muted/50">
                                {user.education}
                              </div>
                            )}
                            {isEditing && <FormMessage />}
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                {isEditing && (
                  <CardFooter className="justify-end">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardFooter>
                )}
              </Card>
              {/* Learning Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Profile</CardTitle>
                  <CardDescription>
                    Information about your learning preferences and interests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>About Me</FormLabel>
                        {isEditing ? (
                          <FormControl>
                            <Textarea {...field} className="min-h-32" />
                          </FormControl>
                        ) : (
                          <div className="p-3 border rounded-md bg-muted/50 min-h-[80px]">
                            {user.bio}
                          </div>
                        )}
                        {isEditing && <FormMessage />}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Interests & Skills</FormLabel>
                        {isEditing ? (
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Web Development, Mobile Apps, Data Science, etc."
                            />
                          </FormControl>
                        ) : (
                          <div className="p-3 border rounded-md bg-muted/50">
                            {interestsTags}
                          </div>
                        )}
                        {isEditing && <FormMessage />}
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              {/* Account Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Password</h4>
                        <p className="text-sm text-muted-foreground">
                          {user.password === null
                            ? "You are logged in with Google. Password changes are managed via your Google account."
                            : "Change your account password"}
                        </p>
                      </div>
                      {user.password !== null && (
                        <CurrentPasswordModal
                          onPasswordVerified={handlePasswordVerified}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </div>
      {/* New Password Modal */}
      <NewPasswordModal
        open={newPasswordModalOpen}
        onOpenChange={setNewPasswordModalOpen}
        onPasswordUpdated={handlePasswordUpdated}
      />
    </div>
  );
}

export default memo(StudentProfile);
