import { useMutation } from "@tanstack/react-query";
import { api } from "../apiClient";

const KEY = "auth";

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  role: "admin" | "member";
  isVerified: boolean;
  token?: string;
}

// Đăng ký
export const useSignup = () =>
  useMutation({
    mutationFn: async (data: {
      username: string;
      password: string;
      email: string;
      fullName?: string;
      phone?: string;
      gender?: string;
    }) => (await api.post("/user/signup", data)).data as {
      message: string;
      token: string;
      user: User;
    },
  });

// Đăng nhập
export const useSignin = () =>
  useMutation({
    mutationFn: async (data: { username: string; password: string }) =>
      (await api.post("/user/signin", data)).data as {
        message: string;
        token: string;
        user: User;
      },
  });

// Tìm kiếm người dùng
export const useSearchUsers = (query: string) =>
  useMutation({
    mutationFn: async () =>
      (await api.get(`/users/search?query=${query}`)).data as User[],
  });
