import { request } from "@/global/axios-global";

export const getPolicyIds = async () => {
  const response = await request.get(`/leave-policies/get-policies`);
  return response.data;
};
