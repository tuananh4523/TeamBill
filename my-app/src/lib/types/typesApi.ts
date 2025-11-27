// ===========================================================
// USER
// ===========================================================
export interface IUser {
  id: string;
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

// ===========================================================
// CATEGORY (API)
// ===========================================================
export interface ICategory {
  id: string;
  userId: string;
  name: string;
  color: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===========================================================
// CATEGORY (UI — Page)
// ===========================================================
export interface UICategory {
  id: string;
  name: string;
  color: string;
  description?: string;
}

// ===========================================================
// WALLET
// ===========================================================
export interface IWallet {
  id: string;
  userId: string;
  walletName: string;
  walletType: "personal" | "group";
  balance: number;
  color?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===========================================================
// TRANSACTION
// ===========================================================
export type TrangThaiGD = "pending" | "completed" | "failed";
export type LoaiGD = "deposit" | "withdraw" | "transfer" | "payment";
export type HuongGD = "in" | "out";

export interface ITransaction {
  id: string;
  walletId: string;
  userId: string;
  type: LoaiGD;
  direction: HuongGD;
  category?: string;
  amount: number;
  fee?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  description?: string;
  status?: TrangThaiGD;
  createdAt?: string;
  updatedAt?: string;
}

// ===========================================================
// TEAM
// ===========================================================
export interface ITeam {
  id: string;
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
  createdAt?: string;
  updatedAt?: string;
}

// ===========================================================
// MEMBER
// ===========================================================
export enum MemberStatus {
  Active = "active",
  Inactive = "inactive",
  Left = "left",
}

export interface IMember {
  id: string;
  userId: string;
  teamId: string;
  name: string;
  email: string;
  avatar?: string;
  role?: "owner" | "admin" | "member";
  status?: MemberStatus;
  contribution?: number;
  balance?: number;
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===========================================================
// EXPENSE
// ===========================================================
export interface IExpense {
  id: string;
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

// ===========================================================
// SPLIT
// ===========================================================
export interface ISplit {
  id: string;
  expenseId: string;
  teamId: string;
  total: number;
  method: "equal" | "percentage" | "custom";
  createdAt?: string;
  updatedAt?: string;
}

// ===========================================================
// SPLIT MEMBER
// ===========================================================
export interface ISplitMember {
  id: string;
  splitId: string;
  memberId: string;
  amount: number;
  percentage?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ===========================================================
// VIETQR
// ===========================================================
export interface IVietQRDepositRequest {
  userId: string;
  amount: number;
  description?: string;
}

export interface IVietQRDepositResponse {
  message: string;
  qrLink: string;
  transactionId: string;
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
