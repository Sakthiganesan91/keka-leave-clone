interface Employee {
  id: number;
  name: string;
  role: string;
  email: string;
  department: string;
}

export type LeavePolicyFormValues = {
  leave_type_name: string;
  need_approval: boolean;
  allow_half_day: boolean;
  max_days_per_year: number;
  paid: boolean;
  deduct_salary: boolean;
  approval_level_needed: number;
  max_days_per_month: number;
  not_approved_leave: Record<string, string>;
  roll_over_allowed: boolean;
  roll_over_count: number;
  roll_over_monthly_allowed: boolean;
};
export interface LeaveEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: string;
  isHalfDay: boolean;
  status: string;
  reason: string;
  employee: Employee;
}

export interface TeamEmployee {
  employee_id: number;
  name: string;
  role: string;
  email: string;
  department: string;
  designation: string;
}

export interface EmployeeCreation {
  name: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  role: string;
  basicSalary: string;
  performanceBonus: string;
  allowances: string;
  lop_deduction: string;
  max_approval_level: string;
  in_notice: string;
  phone_number: string;
}
