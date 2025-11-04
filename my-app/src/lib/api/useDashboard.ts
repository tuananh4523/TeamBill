import { useQuery } from "@tanstack/react-query";
import { api } from "../apiClient";

// export const useDashboardSummary = () =>
//   useQuery({
//     queryKey: ["dashboard-summary"],
//     queryFn: async () => {
//       const [expense, split] = await Promise.all([
//         api.get("/expenses/summary"),
//         api.get("/splits/summary"),
//       ]);
//       return {
//         totalExpenses: expense.data.totalAmount,
//         expenseCount: expense.data.count,
//         splitSummary: split.data,
//       };
//     },
//   });



export interface UserSummary {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  role: "admin" | "member";
}

export interface MemberSummary {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface TeamSummary {
  _id: string;
  name: string;
  members: MemberSummary[];
}

export interface ExpenseSummary {
  totalAmount: number;
  count: number;
}

export interface SplitSummaryItem {
  _id: string; // tên người
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
  count: number;
}

export interface WalletInfo {
  _id: string;
  userId: string;
  soDu: number;
}

export interface WalletTxResponse {
  data: unknown[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface DashboardData {
  userCount: number;
  memberCount: number;
  teamCount: number;
  totalWalletBalance: number;
  totalTransactions: number;
  totalExpenses: number;
  expenseCount: number;
  splitCount: number;
  topPayers: Array<{ name: string; netBalance: number }>;
}

/* =====================
   HOOK CHÍNH
===================== */

export const useDashboardSummary = () =>
  useQuery<DashboardData>({
    queryKey: ["dashboard-summary"],
    queryFn: async (): Promise<DashboardData> => {
      const [usersRes, membersRes, teamsRes, expensesSummary, splitsSummary] =
        await Promise.all([
          api.get<UserSummary[]>("/users/search?query="),
          api.get<MemberSummary[]>("/members"),
          api.get<TeamSummary[]>("/teams"),
          api.get<ExpenseSummary>("/expenses/summary"),
          api.get<SplitSummaryItem[]>("/splits/summary"),
        ]);

      let totalWalletBalance = 0;
      let totalTransactions = 0;

      // Lấy thông tin ví & giao dịch của từng người
      for (const user of usersRes.data) {
        try {
          const walletRes = await api.get<WalletInfo>(
            `/wallet/info?userId=${user._id}`
          );
          totalWalletBalance += walletRes.data.soDu || 0;

          const txRes = await api.get<WalletTxResponse>(
            `/wallet/transactions?userId=${user._id}`
          );
          totalTransactions += txRes.data.pagination.total;
        } catch {
          // Bỏ qua nếu người dùng chưa có ví
        }
      }

      const splitCount = splitsSummary.data.length;
      const topPayers = splitsSummary.data
        .sort((a, b) => b.netBalance - a.netBalance)
        .slice(0, 5)
        .map((s) => ({ name: s._id, netBalance: s.netBalance }));

      return {
        userCount: usersRes.data.length,
        memberCount: membersRes.data.length,
        teamCount: teamsRes.data.length,
        totalWalletBalance,
        totalTransactions,
        totalExpenses: expensesSummary.data.totalAmount,
        expenseCount: expensesSummary.data.count,
        splitCount,
        topPayers,
      };
    },
  });