import axios, { AxiosResponse } from "axios";

/* ======================== CẤU HÌNH AXIOS ======================== */
const API = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ======================== TYPES ======================== */
export interface UserLogin {
  username: string;
  password: string;
}

export interface UserSignup {
  username: string;
  email: string;
  password: string;
  age?: number;
}

export interface UserResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    age?: number;
    role: string;
  };
}

export type TrangThaiGD = "THANHCONG" | "CHO" | "THATBAI";
export type LoaiGD = "NAP" | "RUT" | "CHUYEN" | "THANHTOAN";
export type HuongGD = "CONG" | "TRU";

export interface WalletInfo {
  _id?: string;
  userId?: string;
  soDu: number;
  maThamChieu: string;
  thongTinNganHang_chuTaiKhoan: string;
  thongTinNganHang_soTaiKhoan: string;
  thongTinNganHang_maNganHang: string;
  thongTinNganHang_maNapas?: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface WalletTransaction {
  _id: string;
  walletId: string;
  userId: string;
  code: string;
  refCode: string;
  type: LoaiGD;
  direction: HuongGD;
  amount: number;
  fee?: number;
  description?: string;
  status: TrangThaiGD;
  date: string;
  confirmedAt?: string;
}

/* ======================== WALLET API ======================== */
export const createWallet = (data: {
  userId: string;
  tenVi: string;
  loaiVi: string;
  chuTaiKhoan: string;
  soTaiKhoan: string;
  maNganHang: string;
  maNapas: string;
  tenNganHang: string;
  gioiHanRut?: number;
  gioiHanNap?: number;
  maPIN?: string;
  isLinkedBank?: boolean;
}): Promise<AxiosResponse<{ message: string; vi: WalletInfo }>> =>
  API.post("/wallet/create", data);

export const getWalletInfo = (
  userId: string
): Promise<AxiosResponse<WalletInfo>> =>
  API.get("/wallet/info", { params: { userId } });

export const getWalletTransactions = (
  userId: string
): Promise<
  AxiosResponse<{
    data: WalletTransaction[];
    pagination: { page: number; limit: number; total: number };
  }>
> => API.get("/wallet/transactions", { params: { userId } });

export const depositWallet = (data: {
  userId: string;
  loai: LoaiGD;
  soTien: number;
  moTa?: string;
  fee?: number;
  deviceInfo?: string;
  category?: string;
}): Promise<AxiosResponse<{ message: string; balance: number }>> =>
  API.post("/wallet/deposit", data);

export const withdrawWallet = (data: {
  userId: string;
  loai: LoaiGD;
  soTien: number;
  moTa?: string;
  fee?: number;
  deviceInfo?: string;
  category?: string;
}): Promise<AxiosResponse<{ message: string; balance: number }>> =>
  API.post("/wallet/withdraw", data);

export const taoQRVietQR = (data: {
  userId: string;
  amount?: number;
  description?: string;
}): Promise<
  AxiosResponse<{
    maThamChieu: string;
    qr: { image: string; amount: number; description: string };
    thongTinNganHang_chuTaiKhoan: string;
    thongTinNganHang_soTaiKhoan: string;
    thongTinNganHang_tenNganHang: string;
  }>
> => API.post("/wallet/qr", data);

/* ======================== USER ======================== */
export const signup = (data: UserSignup) =>
  API.post<UserResponse>("/user/signup", data);

export const signin = (data: UserLogin) =>
  API.post<UserResponse>("/user/signin", data);

export default API;
