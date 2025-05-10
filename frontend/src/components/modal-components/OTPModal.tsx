"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import type { UserRole } from "../../pages/AuthForm";
import { cn } from "@/lib/utils";
import { RegisterFormData } from "@/validation";
import { sendOtp } from "@/services/otpService/axiosOTPSend";
import { toast } from "sonner";

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  role?: UserRole;
  data?: RegisterFormData;
}

export function OTPModal({
  isOpen,
  onClose,
  onVerify,
  role = "user",
  data,
}: OTPModalProps) {
  const [otp, setOtp] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  // Get role-specific styling
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "tutor":
        return "bg-purple-500";
      case "user":
      default:
        return "bg-primary";
    }
  };

  // Timer effect
  useEffect(() => {
    if (!isOpen) return;

    // Reset states when modal opens
    setOtp("");
    setTimeLeft(60);
    setCanResend(false);

    // Start the timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup
    return () => clearInterval(timer);
  }, [isOpen]);

  const handleVerify = () => {
    if (otp.length === 6) {
      onVerify(otp);
    } else {
      alert("Please enter a valid 6-digit OTP");
    }
  };

  const handleResendOTP = async () => {
    if (!data) {
      toast.error("Registration data is missing");
      return;
    }

    try {
      // Reset timer and resend OTP
      setTimeLeft(60);
      setCanResend(false);
      const res = await sendOtp(data);
      toast.success(res.message);

      // Start the timer again
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      toast.error("Failed to resend OTP");
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Your Email</DialogTitle>
          <DialogDescription>
            We've sent a 6-digit verification code to your email address. Please
            enter it below to complete your registration.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Centered OTP Input */}
          <div className="w-full space-y-2 flex flex-col items-center">
            <Label htmlFor="otp" className="text-center block">
              Enter verification code
            </Label>
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup className="flex justify-center">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="text-center space-y-4 w-full">
            <div className="text-sm">
              Time remaining:{" "}
              <span className="font-mono font-medium">
                {formatTime(timeLeft)}
              </span>
            </div>

            {canResend ? (
              <Button
                variant="outline"
                onClick={handleResendOTP}
                className="w-full"
              >
                Resend Code
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled
                className="w-full opacity-50 cursor-not-allowed"
              >
                Resend Code
              </Button>
            )}

            <Button
              onClick={handleVerify}
              className={cn("w-full", getRoleColor(role))}
              disabled={otp.length !== 6}
            >
              Verify
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
