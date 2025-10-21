"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { message } from "antd";

export type User = {
  _id?: string;
  username: string;
  email?: string;
  token?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUserData: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================== Khi load trang ================== */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  /* ================== Đăng nhập ================== */
  const login = (userData: User) => {
    setUser(userData);
    if (userData.token) {
      localStorage.setItem("token", userData.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
    }
    localStorage.setItem("user", JSON.stringify(userData));
    message.success(`Xin chào ${userData.username}`);
  };

  /* ================== Đăng xuất ================== */
  const logout = () => {
    setUser(null);
    localStorage.clear();
    delete axios.defaults.headers.common["Authorization"];
    message.info("Đã đăng xuất.");
  };

  /* ================== Lấy lại thông tin người dùng từ server ================== */
  const refreshUserData = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/user/profile");
      setUser(res.data);
    } catch {
      logout(); // Token hết hạn thì tự đăng xuất
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
