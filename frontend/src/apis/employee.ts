import { request } from "@/global/axios-global";

export const getTeamEmployees = async ({
  employeeName = "",
  role = "",
  department = "",
}: {
  employeeName?: string;
  role?: string;
  department?: string;
}) => {
  console.log(role, department);
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
