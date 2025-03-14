import { z } from "zod";

// Register DTO schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Name is required")
    .max(50, "Name must be 50 charecter or less"),
  email: z.string().email("Invalid email address").min(3, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be atleast 8 charecters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.string(),
});

export const withoutRoleRegisterSchema = registerSchema.omit({ role: true });

// Type definitions
export type RegisterDTO = z.infer<typeof registerSchema>;
