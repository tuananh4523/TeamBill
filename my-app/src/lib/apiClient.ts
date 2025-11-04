// src/lib/apiClient.ts
import { message } from "antd";
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Lỗi hệ thống.";
    if (error.response?.status === 401) {
      message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
      localStorage.removeItem("accessToken");
    } else {
      message.error(msg);
    }
    return Promise.reject(error);
  }
);