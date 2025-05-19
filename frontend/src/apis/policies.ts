import { request } from "@/global/axios-global";
import { LeavePolicyFormValues } from "@/types";

export const getPolicyIds = async () => {
  const response = await request.get(`/leave-policies/get-policies`);
  return response.data;
};

export const addPolicies = async (data: LeavePolicyFormValues) => {
  const response = await request.post(`/leave-policies/add-policy`, {
    ...data,
  });

  return response.data;
};

export const getLeavePolicies = async () => {
  const response = await request.get("/leave-policies/get-leave-policies-data");
  return response.data;
};

export const deleteLeavePolicy = async (leavepolicy_id: number) => {
  const response = await request.delete(
    `/leave-policies/delete-policies/${leavepolicy_id}`
  );
  return response.data;
};
