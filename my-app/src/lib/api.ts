import axios, { AxiosResponse } from "axios";
import { message } from "antd";

/* ======================== CẤU HÌNH AXIOS ======================== */
export const API_BASE = "http://localhost:8080/api";

const API = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ✅ Tự động gắn token vào mọi request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // Đồng bộ với login
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ Xử lý lỗi chung
API.interceptors.response.use(
  (res) => res,
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

/* ======================== TYPES ======================== */
// -------- USER --------
export interface IUser {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  token?: string;
}

export interface IUserLogin {
  username: string;
  password: string;
}

export interface IUserSignup {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  gender?: string;
}

export interface IUserResponse {
  message: string;
  token: string;
  user: IUser;
}

/* ======================== USER API ======================== */
export const signup = (data: IUserSignup): Promise<AxiosResponse<IUserResponse>> =>
  API.post("/user/signup", data);

export const signin = (data: IUserLogin): Promise<AxiosResponse<IUserResponse>> =>
  API.post("/user/signin", data);

export const getProfile = (): Promise<AxiosResponse<{ user: IUser }>> =>
  API.get("/user/profile");

/* ======================== WALLET TYPES ======================== */
export type TrangThaiGD = "THANHCONG" | "CHO" | "THATBAI";
export type LoaiGD = "NAP" | "RUT" | "CHUYEN" | "THANHTOAN";
export type HuongGD = "CONG" | "TRU";

export interface IWalletInfo {
  _id?: string;
  userId?: string;
  soDu: number;
  maThamChieu: string;
  thongTinNganHang_chuTaiKhoan: string;
  thongTinNganHang_soTaiKhoan: string;
  thongTinNganHang_maNganHang: string;
  thongTinNganHang_maNapas?: string;
  thongTinNganHang_tenNganHang?: string;
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
}): Promise<AxiosResponse<{ message: string; vi: IWalletInfo }>> =>
  API.post("/wallet/create", data);

export const getWalletInfo = (userId: string): Promise<AxiosResponse<IWalletInfo>> =>
  API.get("/wallet/info", { params: { userId } });

export const getWalletTransactions = (
  userId: string
): Promise<
  AxiosResponse<{
    data: WalletTransaction[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }>
> => API.get("/wallet/transactions", { params: { userId } });

// ✅ Đồng bộ schema backend: bỏ "loai"
export const depositWallet = (data: {
  userId: string;
  soTien: number;
  moTa?: string;
  fee?: number;
  deviceInfo?: string;
  category?: string;
}): Promise<AxiosResponse<{ message: string; balance: number }>> =>
  API.post("/wallet/deposit", data);

export const withdrawWallet = (data: {
  userId: string;
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

/* ======================== TEAM API ======================== */
export interface IMember {
  _id: string;
  userId?: string;
  teamId?: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  status?: string;
}

export interface ITeam {
  _id: string;
  name: string;
  members: IMember[];
  createdAt?: string;
  updatedAt?: string;
}

export const getTeams = (): Promise<AxiosResponse<ITeam[]>> => API.get("/teams");

/* ======================== EXPENSE API ======================== */
export interface IExpense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  status: "CHỜ" | "HOÀN TẤT";
  person: string;
  date: string;
}

export const getExpenses = (): Promise<AxiosResponse<IExpense[]>> =>
  API.get("/expenses");

/* ======================== SPLIT API ======================== */
export interface ISplitMember {
  _id?: string;
  splitId?: string;
  memberId?: string;
  name: string;
  paid: number;
  owed: number;
  balance: number;
}

export interface ISplit {
  _id: string;
  expenseId: string;
  teamId: string;
  total: number;
  method: "EQUAL" | "PERCENTAGE" | "CUSTOM";
  currency: string;
  date: string;
  members?: ISplitMember[];
}

export const getSplits = (): Promise<AxiosResponse<ISplit[]>> =>
  API.get("/splits");

export const createSplit = (
  data: Pick<ISplit, "expenseId" | "teamId" | "total" | "method" | "currency"> & {
    members: ISplitMember[];
  }
): Promise<
  AxiosResponse<{ message: string; split: ISplit; members: ISplitMember[] }>
> => API.post("/splits", data);

/* ======================== DASHBOARD API ======================== */
export interface IMonthlyTransaction {
  _id: number; // tháng (1–12)
  income: number;
  expense: number;
}

export interface ITopSpender {
  _id: string; // tên người
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

export interface IDashboardSummary {
  totalUsers: number;
  totalTeams: number;
  totalMembers: number;
  totalExpenses: number;
  totalSplits: number;
  wallet: {
    totalBalance: number;
    totalNap: number;
    totalRut: number;
  };
  expenses: {
    totalAmount: number;
  };
  topSpenders: ITopSpender[];
  monthlyTransactions: IMonthlyTransaction[];
}

/**
 * Lấy dữ liệu tổng hợp cho Dashboard
 * - Tổng user, team, member, expense, split
 * - Tổng số dư ví, tổng chi tiêu
 * - Top người chi nhiều nhất
 * - Biểu đồ thu / chi theo tháng
 */
export const getDashboardSummary = (): Promise<
  AxiosResponse<IDashboardSummary>
> => API.get("/dashboard/summary");


export default API;
