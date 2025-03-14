"use client";

import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  loginSchema,
  registerSchema,
  LoginFormData,
  RegisterFormData,
} from "@/validation";

export type UserRole = "admin" | "user" | "tutor";

interface AuthFormProps {
  role?: UserRole;
  allowRoleSelection?: boolean;
  showRegistration?: boolean;
  onLogin?: (data: LoginFormData, role: UserRole) => void;
  onRegister?: (data: RegisterFormData, role: UserRole) => void;
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
  const [activeRole, setActiveRole] = useState<UserRole>(role);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);

  // Login form setup
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form setup
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      specialization: "",
    },
  });

  const handleLoginSubmit = (data: LoginFormData) => {
    // console.log(`${activeRole} login submitted:`, data);
    axios
      .post("http://localhost:3000/login", data)
      .then((response) => {
        toast.success(response.data.message)
        loginForm.reset();
  })
      .catch((error) => toast.error(error.response?.data?.error));
    // onLogin?.(data, activeRole);
  };

  const handleRegisterSubmit = (data: RegisterFormData) => {
    axios
      .post("http://localhost:3000/register/otp", { email: data.email })
      .then((response) => {
        toast.success(response.data.message);
        setIsOTPModalOpen(true);
      })
      .catch((error) =>
        toast.error(error.response?.data?.message || "Error sending OTP")
      );
  };

  const handleOTPVerified = (otp: string) => {
    const data = registerForm.getValues();
    axios
      .post("http://localhost:3000/register/verify-otp", {
        email: data.email,
        otp,
      })
      .then((response) => {
        toast.success(response.data.message);
        setIsOTPModalOpen(false);

        axios
          .post("http://localhost:3000/register/user", {
            name: data.name,
            email: data.email,
            password: data.password,
          })
          .then((response) => {
            toast.success(response.data.message);
            onRegister?.(data, activeRole);
            registerForm.reset();
          })
          .catch((error) =>
            toast.error(error.response?.data?.error || "Registration failed")
          );
      })
      .catch((error) =>
        toast.error(error.response?.data?.error || "OTP verification failed")
      );
  };

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
        {/* Role selection header and selector remain unchanged */}
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
                    <Users className="h-4 w-4 mr-2" /> Student
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
                    <GraduationCap className="h-4 w-4 mr-2" /> Tutor
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="login" className="w-full">
          {showRegistration && activeRole !== "admin" ? (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
          ) : (
            <div className="h-10" />
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
              <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      {...loginForm.register("email")}
                      type="email"
                      placeholder="your.email@example.com"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-red-500 text-sm">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        {...loginForm.register("password")}
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
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
                      </Button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-red-500 text-sm">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full"
                    style={{ backgroundColor: roleConfig.color }}
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

          {/* Register Form */}
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
                <form
                  onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
                >
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...registerForm.register("name")}
                        placeholder="John Doe"
                      />
                      {registerForm.formState.errors.name && (
                        <p className="text-red-500 text-sm">
                          {registerForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        {...registerForm.register("email")}
                        type="email"
                        placeholder="your.email@example.com"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-red-500 text-sm">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          {...registerForm.register("password")}
                          type={showRegisterPassword ? "text" : "password"}
                          placeholder="••••••••"
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
                        </Button>
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="text-red-500 text-sm">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          {...registerForm.register("confirmPassword")}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
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
                        </Button>
                      </div>
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-red-500 text-sm">
                          {
                            registerForm.formState.errors.confirmPassword
                              .message
                          }
                        </p>
                      )}
                    </div>
                    {activeRole === "tutor" && (
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                          id="specialization"
                          {...registerForm.register("specialization")}
                          placeholder="e.g. Mathematics, Programming, etc."
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      style={{ backgroundColor: roleConfig.color }}
                    >
                      Register
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          )}
        </Tabs>

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

      <OTPModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        onVerify={handleOTPVerified}
        role={activeRole}
      />
    </div>
  );
}
