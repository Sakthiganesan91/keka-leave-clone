import { request } from "../global/axios-global";

export const getLeaveRequestsByStatus = async ({
  employee_id,
  status,
}: {
  employee_id: number;
  status: string;
}) => {
  const response = await request.get(
    `/employees/get-leaves-by-status?employee_id=${employee_id}&status=${status}`
  );
  return response.data;
};

export const addLeaveReqest = async (
  employeeId: number,
  leaveRequest: {
    start_date: string;
    end_date: string;
    noofdays: number;
    leave_reason: string;
    leaveType: string;
    is_half_day: boolean;
  }
) => {
  const response = await request.post(
    `/leave-requests/add-leave-request/${employeeId}`,
    {
      ...leaveRequest,
    }
  );

  return response.data;
};

export const getTeamLeaves = async (employee_id = 0) => {
  const response = await request.get(
    `/employees/get-team-leaves?employeeIdSearch=${employee_id}`
  );
  return response.data;
};

export const getLeavesForApproval = async (id: number) => {
  const response = await request.get(
    `/leave-requests/get-leave-request?manager_id=${id}`
  );

  return response.data;
};

export const approveLeaveRequest = async ({
  leave_id,
  id,
}: {
  leave_id: number;
  id: number;
}) => {
  const response = await request.put(
    `/leave-requests/approve-leave-request/${leave_id}?id=${id}`
  );

  return response.data;
};

export const rejectOrCancelRequest = async ({
  leave_id,
  id,
  status,
}: {
  leave_id: number;
  id: number;
  status: string;
}) => {
  const response = await request.put(
    `/leave-requests/cancel-leave-request/${leave_id}?id=${id}`,
    {
      cancellation_comment: status,
      status,
    }
  );
  return response.data;
};

export const getLeavesByEmployeeId = async ({
  employee_id,
}: {
  employee_id: number;
}) => {
  const response = await request.get(
    `/employees/get-leave-by-employee/${employee_id}`
  );
  return response.data;
};

export const getRemainingLeavesByEmpoyeeId = async ({
  employee_id,
  leavepolicy_id,
}: {
  employee_id: number;
  leavepolicy_id: number;
}) => {
  const response = await request.get(
    `/employees/get-leave-remaining/${employee_id}?leavepolicy_id=${leavepolicy_id}&year=${new Date().getFullYear()}`
  );
  return response.data;
};

export const getRemainingLeavesByEmpoyeeIdByMonth = async ({
  employee_id,
}: {
  employee_id: number;
}) => {
  const response = await request.get(
    `/employees/get-leave-remaining-by-month/${employee_id}?year=${new Date().getFullYear()}`
  );
  return response.data;
};
