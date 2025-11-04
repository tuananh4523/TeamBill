import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient";

const KEY = "wallet";

/* =====================
   TYPES
===================== */

export type TxType = "NAP" | "RUT" | "CHUYEN" | "THANHTOAN";

export interface WalletInfo {
  _id: string;
  userId: string;
  maThamChieu: string;
  tenVi: string;
  loaiVi: "CÁ NHÂN" | "NHÓM";
  soDu: number;
  tongNap: number;
  tongRut: number;
  gioiHanRut: number;
  gioiHanNap: number;
  trangThai: "KÍCH_HOẠT" | "KHÓA" | "TẠM_DỪNG";
  maPIN?: string;
  isLinkedBank: boolean;
  ngayKichHoat: string;
  lanCapNhatCuoi: string;
  createdAt: string;
  updatedAt: string;

  // các field phẳng mà controller trả về qua ...flattenBank(vi)
  thongTinNganHang_chuTaiKhoan: string;
  thongTinNganHang_soTaiKhoan: string;
  thongTinNganHang_maNganHang: string;
  thongTinNganHang_maNapas: string;
  thongTinNganHang_tenNganHang: string;
}

export interface WalletTransaction {
  _id: string;
  walletId: string;
  userId: string;
  code: string;
  refCode: string;
  type: TxType;
  direction: "CONG" | "TRU";
  category: string;
  amount: number;
  fee: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  status: string; // backend đang để string tự do
  deviceInfo?: string;
  date: string;
  confirmedAt?: string;
}

export interface CreateWalletInput {
  userId: string;
  tenVi?: string;
  loaiVi?: "CÁ NHÂN" | "NHÓM";
  chuTaiKhoan: string;
  soTaiKhoan: string;
  maNganHang: string;
  maNapas: string;
  tenNganHang: string;
  gioiHanRut?: number;
  gioiHanNap?: number;
  maPIN?: string;
  isLinkedBank?: boolean;
}

export interface TransactionInput {
  // bắt buộc vì giaoDichSchema yêu cầu
  loai: TxType; // "NAP" cho nạp, "RUT" cho rút...
  userId: string;
  soTien: number;
  moTa?: string;
  fee?: number;
  deviceInfo?: string;
  category?: string;
}

export interface WalletQRInput {
  userId: string;
  amount: number;
  description?: string;
}

export interface WalletQRResponse {
  maThamChieu: string;
  qr: { image: string; amount: number; description: string };
  thongTinNganHang_chuTaiKhoan: string;
  thongTinNganHang_soTaiKhoan: string;
  thongTinNganHang_maNganHang: string;
  thongTinNganHang_maNapas: string;
  thongTinNganHang_tenNganHang: string;
}

export interface WalletTxParams {
  userId?: string;
  walletId?: string;
  type?: TxType;
  status?: string;
  category?: string;
  dateFrom?: string; // ISO string
  dateTo?: string;   // ISO string
  page?: number;
  limit?: number;
}

export interface WalletTxResponse {
  data: WalletTransaction[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

/* =====================
   HOOKS
===================== */

export const useWalletInfo = (userId: string) =>
  useQuery<WalletInfo>({
    queryKey: [KEY, userId],
    queryFn: async () =>
      (await api.get<WalletInfo>(`/wallet/info?userId=${userId}`)).data,
    enabled: !!userId,
  });

export const useCreateWallet = () => {
  const qc = useQueryClient();
  return useMutation<WalletInfo, unknown, CreateWalletInput>({
    mutationFn: async (data) =>
      (await api.post<WalletInfo>("/wallet/create", data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeposit = () =>
  useMutation<
    { message: string; balance: number; transaction: WalletTransaction },
    unknown,
    TransactionInput
  >({
    mutationFn: async (data) =>
      (await api.post("/wallet/deposit", data)).data,
  });

export const useWithdraw = () =>
  useMutation<
    { message: string; balance: number; transaction: WalletTransaction },
    unknown,
    TransactionInput
  >({
    mutationFn: async (data) =>
      (await api.post("/wallet/withdraw", data)).data,
  });

export const useWalletTransactions = (params?: WalletTxParams) =>
  useQuery<WalletTxResponse>({
    queryKey: [KEY, "transactions", params],
    queryFn: async () =>
      (await api.get<WalletTxResponse>("/wallet/transactions", { params })).data,
  });

export const useWalletQR = () =>
  useMutation<WalletQRResponse, unknown, WalletQRInput>({
    mutationFn: async (data) =>
      (await api.post<WalletQRResponse>("/wallet/qr", data)).data,
  });
