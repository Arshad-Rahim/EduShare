"use client";

import type * as React from "react";
import axios from "axios";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  EyeIcon,
  EyeOffIcon,
  BookOpen,
  Users,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { OTPModal } from "@/components/modal-components/OTPModal";

import { toast } from "sonner";

export type UserRole = "admin" | "user" | "tutor";

interface AuthFormProps {
  role?: UserRole;
  allowRoleSelection?: boolean;
  showRegistration?: boolean;
  onLogin?: (data: any, role: UserRole) => void;
  onRegister?: (data: any, role: UserRole) => void;
  className?: string;
}

export default function AuthForm({
  role = "user",
  allowRoleSelection = false,
  showRegistration = true,
  onLogin,
  onRegister,
  className,
}: AuthFormProps) {
  // Active role state
  const [activeRole, setActiveRole] = useState<UserRole>(role);

  // Form states
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP modal state
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);

  // Form handlers
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log(`${activeRole} login submitted:`, loginData);
    onLogin?.(loginData, activeRole);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    axios
      .post("http://localhost:3000/register/otp", { email: registerData.email })
      .then((data) => toast.success(data.data.message))
      .catch((error) => toast.error(error.data.message));

    // Open OTP modal
    setIsOTPModalOpen(true);
    // toast.success("OTP Send Succesfully");

    // In a real app, you would send the registration data to your API
    console.log(`${activeRole} registration submitted:`, registerData);
  };

  const handleOTPVerified = (otp: string) => {
    // Handle successful OTP verification
    axios
      .post("http://localhost:3000/register/verify-otp", {
        email: registerData.email,
        otp,
      })
      .then((response) => {
        toast.success(response.data.message);
        setIsOTPModalOpen(false);

        onRegister?.(registerData, activeRole);

        axios
          .post("http://localhost:3000/register/user", {
            name: registerData.name,
            email: registerData.email,
            password: registerData.password,
          })
          .then((response) => {
            toast.success(response.data.message);
            setRegisterData({
              name: "",
              email: "",
              password: "",
              confirmPassword: "",
            });
          })
          .catch((error) => toast.error(error.response.data.error));
      })
      .catch((error) => toast.error(error.response.data.error));

    // Reset form or redirect user
  };

  // Get role-specific styling and content
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case "admin":
        return {
          icon: <ShieldCheck className="h-6 w-6" />,
          title: "Admin Portal",
          color: "bg-red-500",
          textColor: "text-red-500",
          borderColor: "border-red-500",
          hoverColor: "hover:bg-red-50",
          activeColor: "bg-red-100",
        };
      case "tutor":
        return {
          icon: <GraduationCap className="h-6 w-6" />,
          title: "Tutor Portal",
          color: "bg-purple-500",
          textColor: "text-purple-500",
          borderColor: "border-purple-500",
          hoverColor: "hover:bg-purple-50",
          activeColor: "bg-purple-100",
        };
      case "user":
      default:
        return {
          icon: <Users className="h-6 w-6" />,
          title: "Student Portal",
          color: "bg-primary",
          textColor: "text-primary",
          borderColor: "border-primary",
          hoverColor: "hover:bg-primary/10",
          activeColor: "bg-primary/20",
        };
    }
  };

  const roleConfig = getRoleConfig(activeRole);

  return (
    <div
      className={cn(
        "flex justify-center items-center min-h-screen p-4 bg-background",
        className
      )}
    >
      <div className="w-full max-w-md">
        {/* Role selection header */}
        <div className="mb-6 text-center">
          <div
            className={cn(
              "inline-flex items-center justify-center p-2 rounded-full",
              roleConfig.color
            )}
          >
            {roleConfig.icon}
          </div>
          <h1 className="mt-4 text-2xl font-bold">{roleConfig.title}</h1>
          <p className="text-muted-foreground">
            {activeRole === "admin"
              ? "Access the admin dashboard"
              : activeRole === "tutor"
              ? "Teach and manage your courses"
              : "Learn and grow with our platform"}
          </p>
        </div>

        {/* Role selector (only shown when allowRoleSelection is true) */}
        {allowRoleSelection && activeRole !== "admin" && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <RadioGroup
                defaultValue={activeRole}
                onValueChange={(value) => setActiveRole(value as UserRole)}
                className="flex"
              >
                <div
                  className={cn(
                    "flex-1 flex items-center space-x-2 rounded-md border p-4 cursor-pointer transition-all",
                    activeRole === "user"
                      ? getRoleConfig("user").activeColor
                      : getRoleConfig("user").hoverColor
                  )}
                >
                  <RadioGroupItem value="user" id="user" />
                  <Label
                    htmlFor="user"
                    className="flex items-center cursor-pointer"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Student
                  </Label>
                </div>
                <div
                  className={cn(
                    "flex-1 flex items-center space-x-2 rounded-md border p-4 cursor-pointer transition-all",
                    activeRole === "tutor"
                      ? getRoleConfig("tutor").activeColor
                      : getRoleConfig("tutor").hoverColor
                  )}
                >
                  <RadioGroupItem value="tutor" id="tutor" />
                  <Label
                    htmlFor="tutor"
                    className="flex items-center cursor-pointer"
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Tutor
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Auth forms */}
        <Tabs defaultValue="login" className="w-full">
          {showRegistration && activeRole !== "admin" ? (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
          ) : (
            <div className="h-10"></div> // Spacer when tabs aren't shown
          )}

          {/* Login Form */}
          <TabsContent value="login">
            <Card className={cn("border-t-4", roleConfig.borderColor)}>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  {activeRole === "admin"
                    ? "Enter your admin credentials"
                    : activeRole === "tutor"
                    ? "Access your tutor dashboard"
                    : "Continue your learning journey"}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLoginSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        name="password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showLoginPassword
                            ? "Hide password"
                            : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full"
                    style={{
                      backgroundColor: getRoleConfig(activeRole).color,
                      borderColor: getRoleConfig(activeRole).color,
                    }}
                  >
                    Login
                  </Button>
                  <Button variant="link" type="button" className="text-sm">
                    Forgot password?
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Register Form - Only shown for user and tutor */}
          {showRegistration && activeRole !== "admin" && (
            <TabsContent value="register">
              <Card className={cn("border-t-4", roleConfig.borderColor)}>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    {activeRole === "tutor"
                      ? "Join as a tutor and start teaching"
                      : "Start your learning journey today"}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegisterSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          name="password"
                          type={showRegisterPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() =>
                            setShowRegisterPassword(!showRegisterPassword)
                          }
                        >
                          {showRegisterPassword ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showRegisterPassword
                              ? "Hide password"
                              : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={registerData.confirmPassword}
                          onChange={handleRegisterChange}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword
                              ? "Hide password"
                              : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </div>

                    {/* Additional fields for tutor */}
                    {activeRole === "tutor" && (
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                          id="specialization"
                          name="specialization"
                          placeholder="e.g. Mathematics, Programming, etc."
                          onChange={(e) =>
                            setRegisterData((prev) => ({
                              ...prev,
                              specialization: e.target.value,
                            }))
                          }
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      style={{
                        backgroundColor: getRoleConfig(activeRole).color,
                        borderColor: getRoleConfig(activeRole).color,
                      }}
                    >
                      Register
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Platform branding */}
        <div className="mt-8 text-center">
          <div className="flex justify-center items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">E-Learning Platform</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Learn, teach, and grow with our community
          </p>
        </div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        onVerify={handleOTPVerified}
        role={activeRole}
      />
    </div>
  );
}
