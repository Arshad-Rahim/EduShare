"use client";

import { useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordResetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordReset: (newPassword: string) => void;
  email?: string;
}

export function PasswordResetModal({
  open,
  onOpenChange,
  onPasswordReset,
  email,
}: PasswordResetModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const validatePasswords = () => {
    // Minimum length check
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsValid(false);
      return false;
    }

    // Uppercase letter check
    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter");
      setIsValid(false);
      return false;
    }

    // Lowercase letter check
    if (!/[a-z]/.test(newPassword)) {
      setError("Password must contain at least one lowercase letter");
      setIsValid(false);
      return false;
    }

    // Number check
    if (!/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one number");
      setIsValid(false);
      return false;
    }

    // Special character check
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setError(
        "Password must contain at least one special character (e.g., !@#$%^&*)"
      );
      setIsValid(false);
      return false;
    }

    // Password match check
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsValid(false);
      return false;
    }

    setError(null);
    setIsValid(true);
    return true;
  };

  const handleSubmit = () => {
    if (validatePasswords()) {
      setTimeout(() => {
        onPasswordReset(newPassword);
        setNewPassword("");
        setConfirmPassword("");
        setIsValid(false);
      }, 1000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            {email
              ? `Create a new password for ${email}`
              : "Create a new password for your account"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(null); // Clear error on change
                }}
                className={error ? "border-destructive pr-10" : "pr-10"}
                onBlur={validatePasswords} // Validate on blur for immediate feedback
              />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showNewPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null); // Clear error on change
                }}
                className={error ? "border-destructive pr-10" : "pr-10"}
                onBlur={validatePasswords} // Validate on blur for immediate feedback
              />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showConfirmPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {isValid && (
              <p className="flex items-center text-sm text-green-500">
                <Check className="mr-1 h-4 w-4" /> Passwords match
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!newPassword || !confirmPassword}
          >
            Reset Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
