import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    phone: z.string().min(10, "Enter a valid phone number"),
    salonName: z.string().min(2, "Salon name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const customerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  birthday: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const serviceSchema = z.object({
  name: z.string().min(2, "Service name is required"),
  price: z.number().min(0, "Price must be positive"),
  duration: z.number().min(5, "Duration must be at least 5 minutes"),
  categoryId: z.string().min(1, "Category is required"),
});

export const appointmentSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  staffId: z.string().min(1, "Staff is required"),
  serviceIds: z.array(z.string()).min(1, "At least one service required"),
  startTime: z.string().min(1, "Start time is required"),
  type: z.enum(["booking", "walkin"]).default("booking"),
  notes: z.string().optional(),
});

export const staffSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  role: z.string().min(1, "Role is required"),
  salary: z.number().min(0).default(0),
  commission: z.number().min(0).max(100).default(0),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  price: z.number().min(0),
  costPrice: z.number().min(0).default(0),
  stock: z.number().min(0).default(0),
  minStock: z.number().min(0).default(5),
  sku: z.string().optional(),
  unit: z.string().default("pcs"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type StaffInput = z.infer<typeof staffSchema>;
export type ProductInput = z.infer<typeof productSchema>;
