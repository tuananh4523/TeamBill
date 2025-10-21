import axios from "axios";

/* ======================== CẤU HÌNH AXIOS ======================== */
const API = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

/* ======================== TYPES ======================== */
// ----- USER -----
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

// ----- MEMBER -----
export interface Member {
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  team?: string;
}

export interface MemberResponse {
  message?: string;
  member?: Member;
}

/* ======================== MEMBER API ======================== */
export const getMembers = () => API.get<Member[]>("/members");
export const getMemberById = (id: string) => API.get<Member>(`/members/${id}`);
export const createMember = (data: Member) => API.post<Member>("/members", data);
export const updateMember = (id: string, data: Partial<Member>) =>
  API.put<Member>(`/members/${id}`, data);
export const deleteMember = (id: string) =>
  API.delete<{ message: string }>(`/members/${id}`);

/* ======================== EXPENSE ======================== */
export interface Expense {
  _id?: string;
  title: string;
  amount: number;
  category: string;
  status: "CHỜ" | "HOÀN TẤT";
  person: string;
  date?: string;
}

export const getExpenses = () => API.get<Expense[]>("/expenses");
export const getExpenseById = (id: string) => API.get<Expense>(`/expenses/${id}`);
export const createExpense = (data: Expense) => API.post<Expense>("/expenses", data);
export const updateExpense = (id: string, data: Partial<Expense>) =>
  API.put<Expense>(`/expenses/${id}`, data);
export const deleteExpense = (id: string) =>
  API.delete<{ message: string }>(`/expenses/${id}`);
export const getExpensesSummary = () =>
  API.get<{ totalAmount: number; count: number }>("/expenses/summary");

/* ======================== TEAM ======================== */
export interface Team {
  _id?: string;
  name: string;
  members: Member[];
}

export const getTeams = () => API.get<Team[]>("/teams");
export const getTeamById = (id: string) => API.get<Team>(`/teams/${id}`);
export const createTeam = (data: { name: string }) => API.post<Team>("/teams", data);
export const addMemberToTeam = (
  teamId: string,
  member: { name: string; email: string; avatar?: string }
) => API.post<Team>(`/teams/${teamId}/members`, member);

/* ======================== SPLIT ======================== */
export interface SplitMember {
  name: string;
  paid: number;
}

export interface Split {
  _id?: string;
  members: SplitMember[];
  total: number;
  date?: string;
}

export const getSplits = () => API.get<Split[]>("/splits");
export const getSplitById = (id: string) => API.get<Split>(`/splits/${id}`);
export const createSplit = (data: Split) => API.post<Split>("/splits", data);
export const updateSplit = (id: string, data: Partial<Split>) =>
  API.put<Split>(`/splits/${id}`, data);
export const deleteSplit = (id: string) =>
  API.delete<{ message: string }>(`/splits/${id}`);
export const getSplitsSummary = () =>
  API.get<{ _id: string; totalPaid: number; count: number }[]>("/splits/summary");

/* ======================== WALLET ======================== */
export interface BankInfo {
  chuTaiKhoan: string;
  soTaiKhoan: string;
  maNganHang: string;
  maNapas?: string;
}

export interface WalletInfo {
  success: boolean;
  balance: number;
  refCode: string;
  bankInfo: BankInfo;
}

export type TrangThaiGD = "THANHCONG" | "CHO" | "THATBAI";
export type LoaiGD = "NAP" | "RUT" | "CHUYEN" | "THANHTOAN";
export type HuongGD = "CONG" | "TRU";

export interface WalletTransaction {
  _id: string;
  code: string;
  type: LoaiGD;
  direction: HuongGD;
  amount: number;
  description?: string;
  status: TrangThaiGD;
  date: string;
}

export interface WalletCreateResponse {
  success: boolean;
  message: string;
  vi?: WalletInfo;
}

export interface WithdrawRequest {
  userId: string;
  soTien: number;
  nganHang: string;
  soTaiKhoan: string;
  chuTaiKhoan: string;
}

export interface WithdrawResponse {
  success: boolean;
  message: string;
  newBalance?: number;
}

/* ======================== WALLET API ======================== */
export const createWallet = (data: {
  userId: string;
  chuTaiKhoan: string;
  soTaiKhoan: string;
  maNganHang: string;
  maNapas: string;
}) => API.post<WalletCreateResponse>("/wallet/create", data);

export const getWalletInfo = (userId: string) =>
  API.get<WalletInfo>("/wallet/info", { params: { userId } });

export const getWalletTransactions = (userId: string) =>
  API.get<{ success: boolean; transactions: WalletTransaction[] }>(
    "/wallet/transactions",
    { params: { userId } }
  );

export const createWalletTransaction = (data: {
  userId: string;
  loai: LoaiGD;
  soTien: number;
  moTa?: string;
}) => API.post("/wallet/transaction", data);

export const taoQRVietQR = (data: { userId: string }) =>
  API.post<{
    success: boolean;
    message: string;
    qrUrl: string;
    thongTinChuyenKhoan: {
      nganHang: string;
      soTaiKhoan: string;
      chuTaiKhoan: string;
      noiDung: string;
    };
  }>("/wallet/qr", data);

export const xacNhanNapTien = (data: { userId: string; soTien: number }) =>
  API.post("/wallet/confirm-topup", data);

export const withdrawWallet = (data: WithdrawRequest) =>
  API.post<WithdrawResponse>("/wallet/withdraw", data);

/* ======================== USER ======================== */
export const signup = (data: UserSignup) =>
  API.post<UserResponse>("/user/signup", data);

export const signin = (data: UserLogin) =>
  API.post<UserResponse>("/user/signin", data);

export const searchUsers = (query: string) =>
  API.get<{ _id: string; username: string; email: string }[]>("/users/search", {
    params: { query },
  });

export default API;
