"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

/* ================== Types ================== */
export type User = {
  username: string;
  email?: string;
  age?: number;
  token?: string;
};

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

interface ApiError {
  message?: string;
  error?: string;
}

/* ================== Component ================== */
const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [messageText, setMessageText] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    try {
      const url = isLogin
        ? "http://localhost:8080/api/user/signin"
        : "http://localhost:8080/api/user/signup";

      const payload: Record<string, string | number> = isLogin
        ? { username, password }
        : { username, password, email, age: typeof age === "number" ? age : 0 };

      const res = await axios.post<User>(url, payload);

      if (isLogin) {
        const userData = res.data;
        if (userData.token) localStorage.setItem("token", userData.token);
        onLoginSuccess(userData);
        onClose();
      } else {
        const agree = window.confirm(
          "Đăng ký thành công! Bạn có muốn chuyển sang đăng nhập?"
        );
        if (agree) setIsLogin(true);
      }
    } catch (err) {
      // ✅ Không dùng any — kiểm tra kiểu AxiosError rõ ràng
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<ApiError>;
        const msg =
          axiosErr.response?.data?.message ||
          axiosErr.response?.data?.error ||
          "Có lỗi xảy ra khi kết nối server.";
        setMessageText(msg);
      } else if (err instanceof Error) {
        setMessageText(err.message);
      } else {
        setMessageText("Lỗi không xác định.");
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl border border-white/10">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-400 text-xl"
        >
          ✕
        </button>

        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <Avatar
            size={64}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#1890ff" }}
          />
        </div>

        {/* Tiêu đề */}
        <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
          {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/30 text-white placeholder-gray-400 border border-gray-700 focus:border-blue-400 focus:ring focus:ring-blue-500/30 outline-none"
            required
          />

          {!isLogin && (
            <>
              <input
                type="email"
                placeholder="Địa chỉ email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/30 text-white placeholder-gray-400 border border-gray-700 focus:border-green-400 outline-none"
                required
              />
              <input
                type="number"
                placeholder="Tuổi"
                value={age}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : "";
                  setAge(val);
                }}
                className="w-full px-4 py-3 rounded-xl bg-black/30 text-white placeholder-gray-400 border border-gray-700 focus:border-green-400 outline-none"
                required
              />
            </>
          )}

          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/30 text-white placeholder-gray-400 border border-gray-700 focus:border-blue-400 outline-none"
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 transition-all duration-300 shadow-lg"
          >
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        {messageText && (
          <p className="text-center mt-4 text-sm text-red-400">{messageText}</p>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin((prev) => !prev)}
            className="text-sm text-gray-300 hover:text-blue-400 transition"
          >
            {isLogin
              ? "Chưa có tài khoản? Đăng ký"
              : "Đã có tài khoản? Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
