import { z } from "zod";

export const EmployeeLoginFormValidation = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters long"),
});

export const LeaveFormValidation = z.object({
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  leaveType: z.string(),
  leave_reason: z.string().min(5, "Invalid Reason"),
  halfday: z.string(),
  start_date_half: z.string(),
  end_date_half: z.string(),
});

export const employeeCreationFormValidation = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Minimum 2 Characters")
    .max(20, "Maximum 20 Characters"),
  email: z.string().trim().email("Invalid email address"),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters long"),
  department: z.string(),
  designation: z.string(),
  role: z.string(),
  basicSalary: z.string(),
  performanceBonus: z.string(),
  allowances: z.string(),
  lop_deduction: z.string(),
  max_approval_level: z.string(),
  in_notice: z.string(),
  phone_number: z
    .string()
    .max(15, "Maximum Length is 15")
    .min(3, "Minimum Length is 3"),
});
