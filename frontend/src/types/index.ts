interface Employee {
  id: number;
  name: string;
  role: string;
  email: string;
  department: string;
}

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
