import { request } from "@/global/axios-global";
import { EmployeeCreation } from "@/types";

export const getTeamEmployees = async ({
  employeeName = "",
  role = "",
  department = "",
}: {
  employeeName?: string;
  role?: string;
  department?: string;
}) => {
  const response = await request.get(
    `/employees/get-team-employees?search=${employeeName}&role=${role}&department=${department}`
  );

  return response.data;
};

export const getRoles = async () => {
  const response = await request.get(`/employees/get-roles`);
  return response.data;
};

export const getDepartments = async () => {
  const response = await request.get(`/employees/get-departments`);
  return response.data;
};

export const createEmployee = async ({
  values,
}: {
  values: EmployeeCreation;
}) => {
  const response = await request.post(`/employees/add-employee`, { ...values });
  return response.data;
};

export const getAllEmployees = async () => {
  const response = await request.get("/employees/get-all-employees");
  return response.data;
};

export const changeEmployeeStatus = async ({
  isActive,
  employeeId,
}: {
  isActive: boolean;
  employeeId: number;
}) => {
  const response = await request.put(
    `/employees/change-employee-status/${employeeId}`,
    {
      is_active: isActive,
    }
  );
  return response.data;
};

export const changeEmployeeNotice = async ({
  inNotice,
  employeeId,
}: {
  inNotice: boolean;
  employeeId: number;
}) => {
  const response = await request.put(
    `/employees/change-employee-notice/${employeeId}`,
    {
      in_notice: inNotice,
    }
  );
  return response.data;
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await request.post("/employees/bulk-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const assignManager = async (
  employeeEmail: string,
  managerEmail: string
) => {
  const response = await request.post(
    `/employees/set-manager?employeeEmail=${employeeEmail}&managerEmail=${managerEmail}`
  );

  return response.data;
};
