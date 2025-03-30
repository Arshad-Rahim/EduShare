'use client';

import  { AxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EyeIcon, EyeOffIcon, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { loginSchema, LoginFormData } from '@/validation';
import { authAxiosInstance } from '@/api/authAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addAdmin } from '@/redux/slice/adminSlice';


const AdminLogin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();


  // Login form setup
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLoginSubmit = async (data: LoginFormData) => {
    try {
      const response = await authAxiosInstance.post('/auth/login', {
        ...data,
        role: 'admin',
      });
      const {  user } = response.data;
      dispatch(addAdmin(user));
      toast.success(response.data.message);
      loginForm.reset();
      navigate('/admin/home');
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error || 'Error Login failed');
      }
    }
  };

  const roleConfig = {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Admin Portal',
    color: 'bg-red-500',
    textColor: 'text-red-500',
    borderColor: 'border-red-500',
  };

  return (
    <div
      className={cn(
        'flex justify-center items-center min-h-screen p-4 bg-background'
      )}
    >
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div
            className={cn(
              'inline-flex items-center justify-center p-2 rounded-full',
              roleConfig.color
            )}
          >
            {roleConfig.icon}
          </div>
          <h1 className="mt-4 text-2xl font-bold">{roleConfig.title}</h1>
          <p className="text-muted-foreground">Access the admin dashboard</p>
        </div>

        <Card className={cn('border-t-4', roleConfig.borderColor)}>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter your admin credentials</CardDescription>
          </CardHeader>
          <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  {...loginForm.register('email')}
                  type="email"
                  placeholder="admin@example.com"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-red-500 text-sm">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    {...loginForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
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
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
