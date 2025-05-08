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
