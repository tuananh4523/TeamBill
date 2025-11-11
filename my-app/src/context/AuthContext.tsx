"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  ReactElement,
} from "react";
import axios from "axios";
import { message } from "antd";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import {
  getUserById,
  getWalletById,
  getMemberById,
  getExpenseById,
  getSplitById,
  getTransactionsByWallet,
  getTeams,
  getExpensesByTeam,
  getMembersByTeam,
  getSplitsByTeam,
  IWallet,
  ITransaction,
  ITeam,
  IMember,
  IExpense,
  ISplit,
} from "@/lib/api";

/* ================== KIỂU DỮ LIỆU ================== */
export interface User {
  id: string;
  username: string;
  email?: string;
  token?: string;
  role?: string;
}

export interface GlobalData {
  wallet: IWallet | null;
  transactions: ITransaction[];
  teams: ITeam[];
  members: IMember[];
  expenses: IExpense[];
  splits: ISplit[];
}

/* ================== CONTEXT TYPE ================== */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: { token: string; user: User }) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  globalData: GlobalData | null;
}

/* ================== KHỞI TẠO CONTEXT ================== */
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => undefined,
  logout: () => undefined,
  refreshUserData: async () => undefined,
  globalData: null,
});

/* ================== COMPONENT CHÍNH ================== */
export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);

  useEffect(() => {
    const init = async (): Promise<void> => {
      const storedUser = localStorage.getItem("user");
      const token = getCookie("accessToken") as string | undefined;

      if (storedUser && token) {
        try {
          const parsed: User = JSON.parse(storedUser);
          const normalized: User = {
            id: parsed.id,
            username: parsed.username,
            email: parsed.email,
            role: parsed.role,
            token,
          };

          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setUser(normalized);
          await loadGlobalData(normalized.id);
        } catch (err) {
          console.error("[Auth Init] Lỗi khôi phục phiên:", err);
          logout();
        }
      }
      setLoading(false);
    };

    void init();
  }, []);

  /* ================== ĐĂNG NHẬP ================== */
  const login = async (resData: { token: string; user: User }): Promise<void> => {
    const { token, user: rawUser } = resData;

    if (!token) {
      message.error("Không có token trả về từ server.");
      return;
    }

    const normalized: User = {
      id: rawUser.id,
      username: rawUser.username,
      email: rawUser.email,
      role: rawUser.role,
      token,
    };

    setCookie("accessToken", token, { maxAge: 7 * 24 * 60 * 60 });
    localStorage.setItem("user", JSON.stringify(normalized));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setUser(normalized);
    message.success(`Xin chào ${normalized.username}`);

    console.log("=== [AuthContext] Thông tin user sau khi đăng nhập ===");
    console.table(normalized);

    await loadGlobalData(normalized.id);
  };

  /* ================== ĐĂNG XUẤT ================== */
  const logout = (): void => {
    setUser(null);
    setGlobalData(null);
    localStorage.clear();
    deleteCookie("accessToken");
    delete axios.defaults.headers.common["Authorization"];
    message.info("Đã đăng xuất.");
  };

  /* ================== LÀM MỚI DỮ LIỆU ================== */
  const refreshUserData = async (): Promise<void> => {
    if (!user?.id) return;
    await loadGlobalData(user.id);
  };

  /* ================== HÀM LOAD TOÀN BỘ DỮ LIỆU ================== */
  const loadGlobalData = async (userId: string): Promise<void> => {
    try {
      // 1. Lấy thông tin user
      const userRes = await getUserById(userId);
      const userData = userRes.data;
      console.groupCollapsed("=== [AuthContext] THÔNG TIN USER ===");
      console.table({
        ID: userData.id,
        Username: userData.username,
        Email: userData.email,
        Role: userData.role,
      });
      console.groupEnd();

      // 2. Lấy ví người dùng (từ localStorage nếu có)
      let walletId: string | null = null;
      const storedWallet = localStorage.getItem("wallet");
      if (storedWallet) {
        try {
          const parsedWallet = JSON.parse(storedWallet);
          walletId = parsedWallet.id;
        } catch {
          console.warn("Không đọc được wallet từ localStorage");
        }
      }

      let userWallet: IWallet | null = null;
      if (walletId) {
        const walletRes = await getWalletById(walletId);
        userWallet = walletRes.data;
        // console.groupCollapsed("=== [AuthContext] THÔNG TIN VÍ ===");
        // console.table({
        //   ID: userWallet.id,
        //   Name: userWallet.walletName,
        //   Type: userWallet.walletType,
        //   Balance: userWallet.balance,
        //   Bank: userWallet.bankAccount_bankName,
        //   Number: userWallet.bankAccount_number,
        // });
        // console.groupEnd();
      }

      // 3. Giao dịch theo ví
      const txRes = userWallet
        ? await getTransactionsByWallet(userWallet.id as string)
        : { data: [] };
      const transactions = txRes.data;
      // console.groupCollapsed("=== [AuthContext] GIAO DỊCH ===");
      // console.table(transactions.slice(0, 5));
      // console.groupEnd();

      // 4. Danh sách team
      const teamRes = await getTeams();
      const myTeams = teamRes.data.filter((t) => t.createdBy === userId);
      // console.groupCollapsed("=== [AuthContext] NHÓM NGƯỜI DÙNG ===");
      // console.table(myTeams);
      // console.groupEnd();

      // 5. Chi tiêu, thành viên, chia tiền của team đầu tiên
      let expenses: IExpense[] = [];
      let members: IMember[] = [];
      let splits: ISplit[] = [];

      if (myTeams.length > 0) {
        const firstTeam = myTeams[0];
        const teamId = firstTeam.id as string;

        const [expRes, memRes, splitRes] = await Promise.all([
          getExpensesByTeam(teamId),
          getMembersByTeam(teamId),
          getSplitsByTeam(teamId),
        ]);

        expenses = expRes.data;
        members = memRes.data;
        splits = splitRes.data;

        // console.groupCollapsed("=== [AuthContext] CHI TIÊU / THÀNH VIÊN / SPLIT ===");
        // console.log("Chi tiêu:", expenses.length, expenses);
        // console.log("Thành viên:", members.length, members);
        // console.log("Chia tiền:", splits.length, splits);
        // console.groupEnd();

        if (expenses[0]) {
          const expDetail = await getExpenseById(expenses[0].id as string);
          console.log("Chi tiết chi tiêu đầu tiên:", expDetail.data);
        }
        if (members[0]) {
          const memDetail = await getMemberById(members[0].id as string);
          console.log("Chi tiết thành viên đầu tiên:", memDetail.data);
        }
        if (splits[0]) {
          const splitDetail = await getSplitById(splits[0].id as string);
          console.log("Chi tiết chia tiền đầu tiên:", splitDetail.data);
        }
      }

      // 6. Lưu global data
      const newData: GlobalData = {
        wallet: userWallet,
        transactions,
        teams: myTeams,
        expenses,
        members,
        splits,
      };

      setGlobalData(newData);
      localStorage.setItem("globalData", JSON.stringify(newData));

      console.groupCollapsed("=== [AuthContext] TỔNG KẾT ===");
      console.table({
        User: userData.username,
        Wallet: userWallet?.walletName,
        Transactions: transactions.length,
        Teams: myTeams.length,
        Expenses: expenses.length,
        Members: members.length,
        Splits: splits.length,
      });
      console.groupEnd();
    } catch (error) {
      console.error("[Auth LoadData] Lỗi tải dữ liệu:", error);
      message.error("Không thể tải dữ liệu người dùng.");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshUserData, globalData }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ================== CUSTOM HOOK ================== */
export const useAuth = (): AuthContextType => useContext(AuthContext);
