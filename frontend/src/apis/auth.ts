import { request } from "../global/axios-global";

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const response = await request.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const logout = async () => {
  await request.post("/auth/logout");
};
