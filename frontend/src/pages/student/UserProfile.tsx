// src/components/StudentProfile.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
  ChevronDown,
  Menu,
  Search,
  X,
  User,
  Edit,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { useDispatch } from "react-redux";
import { removeUser } from "@/redux/slice/userSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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


// Sidebar Component
function Sidebar() {
  return (
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
          <Button variant="ghost" className="w-full justify-start">
            <BookOpen className="mr-2 h-4 w-4" />
            My Courses
          </Button>
        </div>
      </div>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Learning
        </h2>
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start">
            <BookOpen className="mr-2 h-4 w-4" />
            All Courses
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <BookOpen className="mr-2 h-4 w-4" />
            Learning Paths
          </Button>
        </div>
      </div>
    </div>
  );
}

// CurrentPasswordModal Component
const CurrentPasswordModal = ({
  onPasswordVerified,
}: {
  onPasswordVerified: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false); // State for current password visibility

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

  const verifyCurrentPassword = async (password: string): Promise<boolean> => {
    try {
      const response = await authAxiosInstance.post("/verify-password", {
        password,
      });
      return response.data.valid || false;
    } catch (error) {
      console.error("Password verification failed:", error);
      return false;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
      setError("An error occurred. Please try again later.");
    }
  };

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
                        className="pr-10" // Padding-right for icon space
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
};

// Main StudentProfile Component
export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
    bio: "I'm a student passionate about learning new technologies and skills.",
    interests: "Web Development, Mobile Apps, Data Science",
    education: "Computer Science",
  });
  const [formData, setFormData] = useState({ ...user });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newPasswordModalOpen, setNewPasswordModalOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    authAxiosInstance
      .get("/users/me")
      .then((response) => {
        const userData = response.data.users;
        setUser({
          name: userData.name,
          email: userData.email,
          bio:
            userData.bio ||
            "I'm a student passionate about learning new technologies and skills.",
          interests:
            userData.interests || "Web Development, Mobile Apps, Data Science",
          education: userData.education || "Computer Science",
        });
        setFormData({
          name: userData.name,
          email: userData.email,
          bio:
            userData.bio ||
            "I'm a student passionate about learning new technologies and skills.",
          interests:
            userData.interests || "Web Development, Mobile Apps, Data Science",
          education: userData.education || "Computer Science",
        });
      })
      .catch((error) => {
        console.error("Failed to fetch user:", error);
        toast.error("Failed to load profile data");
      });
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    authAxiosInstance
      .post("/users/profileUpdate", formData)
      .then((response) => {
        setUser({ ...formData });
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      })
      .catch((error) => {
        console.error("Update failed:", error);
        toast.error("Failed to update profile!");
      });
  };

  const handleCancel = () => {
    setFormData({ ...user });
    setIsEditing(false);
  };

  const handlePasswordVerified = () => {
    setNewPasswordModalOpen(true); // Open the new password modal
  };

  const handlePasswordUpdated = () => {
    console.log("Password updated successfully!");
    // Optional: Add any post-update actions here (e.g., refresh user data)
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
          <Sidebar />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 p-6">
        <div className="w-full md:w-64 flex-shrink-0">
          <Sidebar />
        </div>

        <div className="flex-1 max-w-4xl w-full">
          <div className="space-y-6">
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
                    {isEditing && (
                      <Button variant="outline" size="sm">
                        Change Photo
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        {isEditing ? (
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        ) : (
                          <div className="p-2 border rounded-md bg-muted/50">
                            {user.name}
                          </div>
                        )}
                      </div>

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

                    <div className="space-y-2">
                      <Label htmlFor="education">Education</Label>
                      {isEditing ? (
                        <Input
                          id="education"
                          name="education"
                          value={formData.education}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="p-2 border rounded-md bg-muted/50">
                          {user.education}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              {isEditing && (
                <CardFooter className="justify-end">
                  <Button onClick={handleSave}>
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
                <div className="space-y-2">
                  <Label htmlFor="bio">About Me</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="min-h-32"
                    />
                  ) : (
                    <div className="p-3 border rounded-md bg-muted/50 min-h-[80px]">
                      {user.bio}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests">Interests & Skills</Label>
                  {isEditing ? (
                    <Textarea
                      id="interests"
                      name="interests"
                      value={formData.interests}
                      onChange={handleInputChange}
                      placeholder="Web Development, Mobile Apps, Data Science, etc."
                    />
                  ) : (
                    <div className="p-3 border rounded-md bg-muted/50">
                      {user.interests.split(",").map((interest, index) => (
                        <span
                          key={index}
                          className="inline-block bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2"
                        >
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              {isEditing && (
                <CardFooter className="justify-end">
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </CardFooter>
              )}
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
                        Change your account password
                      </p>
                    </div>
                    <CurrentPasswordModal
                      onPasswordVerified={handlePasswordVerified}
                    />
                  </div>

                  {/* <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Manage your notification preferences
                      </p>
                    </div>
                    <Button variant="outline">Manage</Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-destructive">
                        Delete Account
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button variant="destructive">Delete Account</Button>
                  </div> */}
                </div>
              </CardContent>
            </Card>
          </div>
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
