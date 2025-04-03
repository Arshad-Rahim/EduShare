// src/components/CurrentPasswordModal.tsx
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authAxiosInstance } from "@/api/authAxiosInstance";

// Define the schema for the form using Zod
const formSchema = z.object({
  currentPassword: z
    .string()
    .min(1, { message: "Current password is required" }),
});

// Props for the component
interface CurrentPasswordModalProps {
  onPasswordVerified: () => void; // Callback to proceed to the next step
}

export const CurrentPasswordModal = ({
  onPasswordVerified,
}: CurrentPasswordModalProps) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the form with react-hook-form and Zod
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
      if (response.data.valid) {
        return response.data.valid;
      }
      return false;
    } catch (error) {
      console.error("Password verification failed:", error);
      return false;
    }
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const isValid = await verifyCurrentPassword(values.currentPassword);
      if (isValid) {
        setError(null);
        setOpen(false); // Close the modal
        onPasswordVerified(); // Proceed to the next step
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch (err) {
      console.error(err)
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
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your current password"
                      {...field}
                    />
                  </FormControl>
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
