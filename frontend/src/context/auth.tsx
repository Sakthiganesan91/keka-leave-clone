import { request } from "../global/axios-global";
import React, { createContext, useState, useContext, useEffect } from "react";

export interface User {
  id: number;
  email: string;
  role: "employee" | "manager" | "hr" | "admin";
}

interface AuthContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => null,
  login: () => null,
  logout: () => null,
});

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}): React.ReactNode => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (user: User) => {
    try {
      setUser(user);

      const userStr = JSON.stringify(user);

      localStorage.setItem("user", userStr);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };
  const veriyfUser = async (user: User) => {
    try {
      const response = await request.post("/auth/verify-token");

      if (response.data.tokenValid) {
        login(user);
      } else {
        logout();
      }
    } catch (error) {
      logout();
    }
  };
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;

    if (user) {
      veriyfUser(user);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
