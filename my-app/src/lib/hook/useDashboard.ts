import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { message } from "antd";
import {
  getUserById,
  getWallets,
  getWalletById,
  getTransactionsByWallet,
  getTeams,
  getMembersByTeam,
  getExpensesByTeam,
  IUser,
  ITransaction,
  IWallet,
  ITeam,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

/* ======================== KIỂU DỮ LIỆU DASHBOARD ======================== */
export interface IDashboardSummary {
  userInfo: IUser;
  wallet: IWallet;
  transactions: ITransaction[];
  totalExpenses: number;
  joinedTeams: {
    total: number;
    list: ITeam[];
  };
}

interface ApiError {
  message?: string;
  error?: string;
}

// Kiểu riêng cho API getWalletById
interface WalletResponse {
  message: string;
  data: IWallet;
}

/* ===========================================================
   HOOK: LẤY DỮ LIỆU DASHBOARD NGƯỜI DÙNG
=========================================================== */
export const useDashboardSummary = () => {
  const { user } = useAuth();

  return useQuery<IDashboardSummary, AxiosError<ApiError>>({
    queryKey: ["dashboard", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<IDashboardSummary> => {
      if (!user?.id) throw new Error("Chưa đăng nhập.");

      console.groupCollapsed(
        `%c[Dashboard] Bắt đầu tải dữ liệu cho userId=${user.id}`,
        "color:#888"
      );
      const start = performance.now();

      try {
        // 1. Lấy thông tin người dùng
        const { data: userInfo } = await getUserById(user.id);
        console.log("[User]", userInfo);

        // 2. Lấy ví của người dùng đăng nhập
        const { data: allWallets } = await getWallets();
        const userWallet = allWallets.find((wallet) => {
          const walletUserId =
            (
              wallet.userId as { _id?: string; toString?: () => string }
            )?.toString?.() || (wallet.userId as string);
          return walletUserId === user.id;
        });

        if (!userWallet) throw new Error("Không tìm thấy ví của người dùng.");

        const walletId = userWallet.id || userWallet._id || "";

        // 3. Lấy thông tin ví (chuẩn hóa theo kiểu WalletResponse)
        const response: AxiosResponse<IWallet | WalletResponse> =
          await getWalletById(walletId);

        // Nếu API trả về { message, data }, ta lấy response.data.data
        const rawWallet: IWallet =
          (response.data as WalletResponse).data || (response.data as IWallet);

        const wallet: IWallet = {
          ...rawWallet,
          balance: rawWallet.balance ?? 0,
          totalDeposit: rawWallet.totalDeposit ?? 0,
          totalWithdraw: rawWallet.totalWithdraw ?? 0,
        };

        console.log("[Wallet] Ví người dùng:", wallet);

        // 4. Lấy giao dịch của ví
        const { data: transactions } = await getTransactionsByWallet(walletId);
        console.log("[Transactions] Tổng giao dịch:", transactions.length);

        // 5. Lấy danh sách nhóm mà user tham gia
        const { data: allTeams } = await getTeams();
        const joinedTeams: ITeam[] = [];

        for (const team of allTeams) {
          const teamId = team.id || team._id || "";
          const { data: members } = await getMembersByTeam(teamId);
          const isMember = members.some((m) => m.userId === user.id);
          if (isMember) joinedTeams.push(team);
        }

        console.log("[Teams] Tổng nhóm user tham gia:", joinedTeams.length);

        // 6. Tính tổng chi tiêu mà user tạo trong các nhóm
        let totalExpenses = 0;
        for (const team of joinedTeams) {
          const teamId = team.id || team._id || "";
          const { data: expenses } = await getExpensesByTeam(teamId);
          const userExpenses = expenses.filter(
            (e) => e.createdBy === user.id
          );
          totalExpenses += userExpenses.reduce(
            (sum, e) => sum + (e.amount ?? 0),
            0
          );
        }

        console.log("[Expenses] Tổng chi tiêu của user:", totalExpenses);

        // 7. Tổng hợp kết quả
        const result: IDashboardSummary = {
          userInfo,
          wallet,
          transactions,
          totalExpenses,
          joinedTeams: {
            total: joinedTeams.length,
            list: joinedTeams,
          },
        };

        const end = performance.now();
        console.log(
          `%c[Dashboard] Hoàn tất trong ${(end - start).toFixed(2)}ms`,
          "color:#0a0"
        );
        console.groupEnd();

        return result;
      } catch (error) {
        const err = error as AxiosError<ApiError>;
        console.error("[Dashboard] Lỗi:", err.response?.data || err.message);
        message.error(
          err.response?.data?.message || "Không thể tải dữ liệu Dashboard"
        );
        console.groupEnd();
        throw err;
      }
    },
  });
};
