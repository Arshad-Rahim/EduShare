'use client';

import type React from 'react';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmailVerified: (email: string) => void;
}

export function EmailModal({
  open,
  onOpenChange,
  onEmailVerified,
}: EmailModalProps) {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setIsValid(null);
  };

  const handleVerify = () => {
    const valid = validateEmail(email);
    setIsValid(valid);

    if (valid) {
      setTimeout(() => {
        onEmailVerified(email);
        setEmail('');
      }, 1000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Verify Email</DialogTitle>
          <DialogDescription>
            Please enter your email address to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={handleEmailChange}
                className={isValid === false ? 'border-destructive pr-10' : ''}
              />
              {isValid === true && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  <Check className="h-5 w-5" />
                </div>
              )}
              {isValid === false && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
                  <X className="h-5 w-5" />
                </div>
              )}
            </div>
            {isValid === false && (
              <p className="text-sm text-destructive">
                Please enter a valid email address
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleVerify} disabled={!email}>
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
