import { createModel } from "@rematch/core";
import { RootModel } from "./index";

interface User {
  employee_id: number;
  name: string;
  email: string;
  designation: string;
  department: string;
  manager_id: number | null;
  max_approval_level: number;
  role: string;
  base_salary: number;
  in_notice: number;
  is_active: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
}

export const userAuth = createModel<RootModel>()({
  state: {
    token: null,
    user: null,
  } as AuthState,
  reducers: {
    setAuthState(state, payload: AuthState) {
      return { ...state, ...payload };
    },
    clearAuthState() {
      return { token: null, user: null };
    },
  },
  effects: (dispatch) => ({
    async login(payload: { token: string; user: User }) {
      dispatch.userAuth.setAuthState(payload);
    },
    async logout() {
      dispatch.userAuth.clearAuthState();
    },
  }),
});
