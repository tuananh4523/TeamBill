"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  ReactElement,
} from "react";
import axios from "axios";
import { message } from "antd";
import { setCookie, getCookie, deleteCookie } from "cookies-next";

export type User = {
  id: string;
  username: string;
  email?: string;
  role?: string;
  token?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (data: { token: string; user: User }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => undefined,
  logout: () => undefined,
});

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCookie("accessToken") as string | undefined;
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        setUser({ ...parsed, token });
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch {
        logout();
      }
    }

    setLoading(false);
  }, []);

  const login = async ({
    token,
    user: rawUser,
  }: {
    token: string;
    user: User;
  }): Promise<void> => {
    if (!token) {
      message.error("Token không hợp lệ");
      return;
    }

    const newUser: User = {
      ...rawUser,
      token,
    };

    setCookie("accessToken", token, {
      maxAge: 7 * 24 * 60 * 60,
    });
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", token);

    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;

    setUser(newUser);

    message.success(`Xin chào ${newUser.username}`);
  };

  const logout = (): void => {
    setUser(null);

    deleteCookie("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    delete axios.defaults.headers.common["Authorization"];

    message.info("Đã đăng xuất");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};