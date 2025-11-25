import axios, { AxiosResponse } from "axios";

/* ===========================================================
   CẤU HÌNH AXIOS
=========================================================== */
const API = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: false,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ===========================================================
   HÀM CHUẨN HÓA ID (_id → id)
=========================================================== */
function normalizeId<T extends { _id?: string; id?: string }>(obj: T): T & { id: string } {
  if (!obj) return obj;
  return { ...obj, id: obj.id ?? obj._id ?? "" };
}

function normalizeArray<T extends { _id?: string; id?: string }>(arr: T[]): (T & { id: string })[] {
  return arr.map((item) => normalizeId(item));
}

/* ===========================================================
   ENUM & KIỂU DỮ LIỆU DÙNG CHUNG
=========================================================== */
export type TrangThaiGD = "pending" | "completed" | "failed";
export type LoaiGD = "deposit" | "withdraw" | "transfer" | "payment";
export type HuongGD = "in" | "out";

/* ===========================================================
   USER API
=========================================================== */
export interface IUser {
  id: string;
  _id?: string;
  username: string;
  email: string;
  phone?: string;
  fullName?: string;
  role: "admin" | "member";
  isVerified?: boolean;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
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
}

export interface IUserResponse {
  message: string;
  token: string;
  user: IUser;
}

export const signin = async (
  data: IUserLogin
): Promise<AxiosResponse<IUserResponse>> => {
  const res = await API.post("/users/signin", data);
  res.data.user = normalizeId(res.data.user);
  return res;
};

export const signup = async (
  data: IUserSignup
): Promise<AxiosResponse<IUserResponse>> => {
  const res = await API.post("/users/signup", data);
  res.data.user = normalizeId(res.data.user);
  return res;
};

export const getUsers = async (): Promise<AxiosResponse<IUser[]>> => {
  const res = await API.get("/users");
  res.data = normalizeArray(res.data);
  return res;
};

export const getUserById = async (id: string): Promise<AxiosResponse<IUser>> => {
  const res = await API.get(`/users/${id}`);
  res.data = normalizeId(res.data);
  return res;
};

export const updateUser = async (
  id: string,
  data: Partial<IUser>
): Promise<AxiosResponse<{ message: string; user: IUser }>> => {
  const res = await API.put(`/users/${id}`, data);
  res.data.user = normalizeId(res.data.user);
  return res;
};

export const deleteUser = (id: string): Promise<AxiosResponse<{ message: string }>> =>
  API.delete(`/users/${id}`);

/* ===========================================================
   WALLET API
=========================================================== */
export interface IWallet {
  id?: string;
  _id?: string;
  userId: string;
  refCode?: string;
  walletName: string;
  walletType: "personal" | "group";
  balance: number;
  totalDeposit?: number;
  totalWithdraw?: number;
  withdrawLimit?: number;
  depositLimit?: number;
  bankAccount_holderName?: string;
  bankAccount_number?: string;
  bankAccount_bankCode?: string;
  bankAccount_napasCode?: string;
  bankAccount_bankName?: string;
  pinCode?: string;
  isLinkedBank?: boolean;
  status: "active" | "inactive" | "locked";
  activatedAt?: string;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const createWallet = async (
  data: IWallet
): Promise<AxiosResponse<{ message: string; wallet: IWallet }>> => {
  const res = await API.post("/wallets", data);
  res.data.wallet = normalizeId(res.data.wallet);
  return res;
};

export const getWallets = async (): Promise<AxiosResponse<IWallet[]>> => {
  const res = await API.get("/wallets");
  res.data = normalizeArray(res.data);
  return res;
};

export const getWalletById = async (id: string): Promise<AxiosResponse<IWallet>> => {
  const res = await API.get(`/wallets/${id}`);
  res.data = normalizeId(res.data);
  return res;
};

export const updateWallet = async (
  id: string,
  data: Partial<IWallet>
): Promise<AxiosResponse<{ message: string; wallet: IWallet }>> => {
  const res = await API.put(`/wallets/${id}`, data);
  res.data.wallet = normalizeId(res.data.wallet);
  return res;
};

export const deleteWallet = (id: string): Promise<AxiosResponse<{ message: string }>> =>
  API.delete(`/wallets/${id}`);

/* ===========================================================
   TRANSACTION API
=========================================================== */
export interface ITransaction {
  id?: string;
  _id?: string;
  walletId: string;
  userId: string;
  code?: string;
  refCode?: string;
  type: LoaiGD;
  direction: HuongGD;
  category?: string;
  amount: number;
  fee?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  description?: string;
  status?: TrangThaiGD;
  deviceInfo?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const createTransaction = async (
  data: ITransaction
): Promise<AxiosResponse<{ message: string; transaction: ITransaction }>> => {
  const res = await API.post("/transactions", data);
  res.data.transaction = normalizeId(res.data.transaction);
  return res;
};

export const getTransactionsByWallet = async (
  walletId: string
): Promise<AxiosResponse<ITransaction[]>> => {
  const res = await API.get(`/transactions/wallet/${walletId}`);
  res.data = normalizeArray(res.data);
  return res;
};

export const getTransactionById = async (
  id: string
): Promise<AxiosResponse<ITransaction>> => {
  const res = await API.get(`/transactions/${id}`);
  res.data = normalizeId(res.data);
  return res;
};

export const updateTransaction = async (
  id: string,
  data: Partial<ITransaction>
): Promise<AxiosResponse<{ message: string; transaction: ITransaction }>> => {
  const res = await API.put(`/transactions/${id}`, data);
  res.data.transaction = normalizeId(res.data.transaction);
  return res;
};

export const deleteTransaction = (id: string): Promise<AxiosResponse<{ message: string }>> =>
  API.delete(`/transactions/${id}`);

/* ===========================================================
   TEAM API
=========================================================== */
export interface ITeam {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  avatar?: string;
  refCode?: string;
  createdBy: string;
  membersCount?: number;
  walletId?: string;
  privacy?: "public" | "private" | "invite-only";
  status?: "active" | "inactive" | "archived";
  totalExpense?: number;
  lastActivity?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const createTeam = async (
  data: ITeam
): Promise<AxiosResponse<{ message: string; team: ITeam }>> => {
  const res = await API.post("/teams", data);
  res.data.team = normalizeId(res.data.team);
  return res;
};

export const getTeams = async (): Promise<AxiosResponse<ITeam[]>> => {
  const res = await API.get("/teams");
  res.data = normalizeArray(res.data);
  return res;
};

export const getTeamById = async (id: string): Promise<AxiosResponse<ITeam>> => {
  const res = await API.get(`/teams/${id}`);
  res.data = normalizeId(res.data);
  return res;
};

export const updateTeam = async (
  id: string,
  data: Partial<ITeam>
): Promise<AxiosResponse<{ message: string; team: ITeam }>> => {
  const res = await API.put(`/teams/${id}`, data);
  res.data.team = normalizeId(res.data.team);
  return res;
};

export const deleteTeam = (id: string): Promise<AxiosResponse<{ message: string }>> =>
  API.delete(`/teams/${id}`);

/* ===========================================================
   MEMBER API
=========================================================== */
export enum MemberStatus {
  Active = "active",
  Inactive = "inactive",
  Left = "left",
}
export interface IMember {
  id?: string;
  _id?: string;
  userId: string;
  teamId: string;
  name: string;
  email: string;
  avatar?: string;
  role?: "owner" | "admin" | "member";
  status?: MemberStatus ;
  contribution?: number;
  balance?: number;
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const createMember = async (
  data: IMember
): Promise<AxiosResponse<{ message: string; member: IMember }>> => {
  const res = await API.post("/members", data);
  res.data.member = normalizeId(res.data.member);
  return res;
};

export const getMembersByTeam = async (
  teamId: string
): Promise<AxiosResponse<IMember[]>> => {
  const res = await API.get(`/members/team/${teamId}`);
  res.data = normalizeArray(res.data);
  return res;
};

export const getMemberById = async (id: string): Promise<AxiosResponse<IMember>> => {
  const res = await API.get(`/members/${id}`);
  res.data = normalizeId(res.data);
  return res;
};

export const updateMember = async (
  id: string,
  data: Partial<IMember>
): Promise<AxiosResponse<{ message: string; member: IMember }>> => {
  const res = await API.put(`/members/${id}`, data);
  res.data.member = normalizeId(res.data.member);
  return res;
};

export const deleteMember = (id: string): Promise<AxiosResponse<{ message: string }>> =>
  API.delete(`/members/${id}`);

/* ===========================================================
   EXPENSE API
=========================================================== */
export interface IExpense {
  id?: string;
  _id?: string;
  teamId: string;
  createdBy: string;
  title: string;
  amount: number;
  category?: string;
  description?: string;
  status?: "pending" | "completed" | "cancelled";
  paidBy?: string;
  splitMethod?: "equal" | "percentage" | "custom";
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const createExpense = async (
  data: IExpense
): Promise<AxiosResponse<{ message: string; expense: IExpense }>> => {
  const res = await API.post("/expenses", data);
  res.data.expense = normalizeId(res.data.expense);
  return res;
};

export const getExpensesByTeam = async (
  teamId: string
): Promise<AxiosResponse<IExpense[]>> => {
  const res = await API.get(`/expenses/team/${teamId}`);
  res.data = normalizeArray(res.data);
  return res;
};

export const getExpenseById = async (id: string): Promise<AxiosResponse<IExpense>> => {
  const res = await API.get(`/expenses/${id}`);
  res.data = normalizeId(res.data);
  return res;
};

export const updateExpense = async (
  id: string,
  data: Partial<IExpense>
): Promise<AxiosResponse<{ message: string; expense: IExpense }>> => {
  const res = await API.put(`/expenses/${id}`, data);
  res.data.expense = normalizeId(res.data.expense);
  return res;
};

export const deleteExpense = (id: string): Promise<AxiosResponse<{ message: string }>> =>
  API.delete(`/expenses/${id}`);

/* ===========================================================
   SPLIT API
=========================================================== */
export interface ISplit {
  id?: string;
  _id?: string;
  expenseId: string;
  teamId: string;
  total: number;
  method: "equal" | "percentage" | "custom";
  currency?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const createSplit = async (
  data: ISplit
): Promise<AxiosResponse<{ message: string; split: ISplit }>> => {
  const res = await API.post("/splits", data);
  res.data.split = normalizeId(res.data.split);
  return res;
};

export const getSplitsByTeam = async (
  teamId: string
): Promise<AxiosResponse<ISplit[]>> => {
  const res = await API.get(`/splits/team/${teamId}`);
  res.data = normalizeArray(res.data);
  return res;
};

export const getSplitsByExpense = async (
  expenseId: string
): Promise<AxiosResponse<ISplit>> => {
  const res = await API.get(`/splits/expense/${expenseId}`);
  res.data = normalizeId(res.data);
  return res;
};

export const getSplitById = async (id: string): Promise<AxiosResponse<ISplit>> => {
  const res = await API.get(`/splits/${id}`);
  res.data = normalizeId(res.data);
  return res;
};

export const updateSplit = async (
  id: string,
  data: Partial<ISplit>
): Promise<AxiosResponse<{ message: string; split: ISplit }>> => {
  const res = await API.put(`/splits/${id}`, data);
  res.data.split = normalizeId(res.data.split);
  return res;
};

export const deleteSplit = (id: string): Promise<AxiosResponse<{ message: string }>> =>
  API.delete(`/splits/${id}`);

/* ===========================================================
   SPLIT MEMBER API
=========================================================== */

export interface ISplitMember {
  id?: string;
  _id?: string;
  splitId: string;
  memberId: string;
  amount: number;
  percentage?: number;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const createSplitMember = async (
  data: ISplitMember
): Promise<AxiosResponse<{ message: string; splitMember: ISplitMember }>> => {
  const res = await API.post("/split-members", data);
  res.data.splitMember = normalizeId(res.data.splitMember);
  return res;
};

export const getSplitMembersBySplit = async (
  splitId: string
): Promise<AxiosResponse<ISplitMember[]>> => {
  const res = await API.get(`/split-members/split/${splitId}`);
  res.data = normalizeArray(res.data);
  return res;
};

export const getSplitMemberById = async (
  id: string
): Promise<AxiosResponse<ISplitMember>> => {
  const res = await API.get(`/split-members/${id}`);
  res.data = normalizeId(res.data);
  return res;
};

export const updateSplitMember = async (
  id: string,
  data: Partial<ISplitMember>
): Promise<AxiosResponse<{ message: string; splitMember: ISplitMember }>> => {
  const res = await API.put(`/split-members/${id}`, data);
  res.data.splitMember = normalizeId(res.data.splitMember);
  return res;
};

export const deleteSplitMember = (
  id: string
): Promise<AxiosResponse<{ message: string }>> => API.delete(`/split-members/${id}`);

/* ===========================================================
   PAYMENT / VIETQR API
=========================================================== */

export interface IVietQRDepositRequest {
  userId: string;
  amount: number;
  description?: string;
}

export interface IVietQRDepositResponse {
  message: string;
  qrLink: string;
  transactionId: string;
  transCode: string;
  bankInfo: {
    bankName: string;
    holderName: string;
    accountNumber: string;
  };
}

export interface IVietQRConfirmResponse {
  message: string;
  wallet: IWallet;
  transaction: ITransaction;
}


/* ============================
   Tạo QR nạp tiền ViệtQR
=============================== */
export const createVietQRDeposit = async (
  walletId: string,
  data: IVietQRDepositRequest
): Promise<AxiosResponse<IVietQRDepositResponse>> => {

  const res = await API.post(
    `/payments/wallet/${walletId}/deposit/vietqr`,
    data
  );
  return res;
};


/* ============================
   Xác nhận đã chuyển khoản
=============================== */
export const confirmVietQRDeposit = async (
  transactionId: string
): Promise<AxiosResponse<IVietQRConfirmResponse>> => {

  const res = await API.post(`/payments/deposit/${transactionId}/confirm`);

  // Backend trả wallet + transaction → cần normalize
  res.data.wallet = normalizeId(res.data.wallet);
  res.data.transaction = normalizeId(res.data.transaction);

  return res;
};

/* ===========================================================
   CATEGORY API 
=========================================================== */

export interface ICategory {
  id: string;           
  _id?: string;
  userId: string;
  name: string;
  color: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* Lấy categories theo userId  */
export const getCategories = async (
  userId: string
): Promise<AxiosResponse<ICategory[]>> => {
  const res = await API.get("/categories", {
    params: { userId },
  });

  // Normalize _id -> id
  res.data = normalizeArray(res.data);

  return res;
};

/* Lấy chi tiết category */
export const getCategoryById = async (
  id: string
): Promise<AxiosResponse<ICategory>> => {
  const res = await API.get(`/categories/${id}`);

  res.data = normalizeId(res.data);

  return res;
};

/* POST /categories  */
export const createCategory = async (
  data: Partial<ICategory>
): Promise<AxiosResponse<{ message: string; category: ICategory }>> => {
  const res = await API.post("/categories", data);

  res.data.category = normalizeId(res.data.category);

  return res;
};

/* PUT /categories/:id  */
export const updateCategory = async (
  id: string,
  data: Partial<ICategory>
): Promise<AxiosResponse<{ message: string; category: ICategory }>> => {
  const res = await API.put(`/categories/${id}`, data);

  res.data.category = normalizeId(res.data.category);

  return res;
};

/* DELETE /categories/:id  */
export const deleteCategory = (id: string) =>
  API.delete<{ message: string }>(`/categories/${id}`);


export default API;
