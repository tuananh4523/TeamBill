import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { message } from "antd";

interface IApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/* ============================================================
   INTERCEPTOR REQUEST
   - Tự động gắn token JWT nếu có
   - Bảo vệ môi trường SSR của Next.js
   ============================================================ */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ============================================================
   INTERCEPTOR RESPONSE
   - Xử lý lỗi toàn cục có typing
   ============================================================ */
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError<IApiErrorResponse>) => {
    if (!error.response) {
      message.error("Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const msg =
      data?.message || data?.error || `Lỗi máy chủ (${status ?? "?"})`;

    switch (status) {
      case 401:
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
        break;
      case 403:
        message.warning("Bạn không có quyền thực hiện thao tác này.");
        break;
      case 404:
        message.warning("Không tìm thấy tài nguyên yêu cầu.");
        break;
      default:
        message.error(msg);
        break;
    }

    return Promise.reject(error);
  }
);

export default api;
