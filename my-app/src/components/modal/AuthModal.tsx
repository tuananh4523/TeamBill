"use client";

import React, { useState } from "react";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

import { useSignin, useSignup } from "@/hooks/api";
import { SigninPayload, SignupPayload, AuthResponse } from "@/types";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (data: AuthResponse) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  const [messageText, setMessageText] = useState("");

  const signinMutation = useSignin();
  const signupMutation = useSignup();

  if (!isOpen) return null;

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setMessageText("");

    try {
      if (isLogin) {
        const payload: SigninPayload = {
          username,
          password,
        };

        const data = await signinMutation.mutateAsync(payload);

        localStorage.setItem("token", data.token);

        onLoginSuccess(data);
        onClose();
      } else {
        const payload: SignupPayload = {
          username,
          password,
          email,
          fullName,
        };

        await signupMutation.mutateAsync(payload);

        alert("Đăng ký thành công! Hãy đăng nhập.");
        setIsLogin(true);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể kết nối máy chủ.";

      setMessageText(message);
    }
  };

  const loading = signinMutation.isPending || signupMutation.isPending;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-400 text-xl"
        >
          ✕
        </button>

        <div className="flex justify-center mb-4">
          <Avatar
            size={64}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#1677ff" }}
          />
        </div>

        <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
          {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/30 text-white border border-gray-700 outline-none"
            required
          />

          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/30 text-white border border-gray-700 outline-none"
                required
              />

              <input
                type="email"
                placeholder="Địa chỉ email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/30 text-white border border-gray-700 outline-none"
                required
              />
            </>
          )}

          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/30 text-white border border-gray-700 outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-teal-400"
            }`}
          >
            {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        {messageText && (
          <p className="text-center mt-4 text-sm text-red-400">
            {messageText}
          </p>
        )}

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setIsLogin((prev) => !prev)}
            className="text-sm text-gray-300 hover:text-blue-400"
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