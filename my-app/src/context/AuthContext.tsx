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

/* ================== Kiểu dữ liệu ================== */
export interface User {
  _id: string;
  username: string;
  id?: string;
  email?: string;
  token?: string;
  role?: string;
}

export interface BankInfo {
  chuTaiKhoan: string;
  soTaiKhoan: string;
  maNganHang: string;
  maNapas: string;
}

export interface WalletInfo {
  success: boolean;
  balance: number;
  refCode: string;
  bankInfo: BankInfo;
}

export interface Transaction {
  _id: string;
  walletId: string;
  code: string;
  type: "NAP" | "RUT" | "CHUYEN" | "THANHTOAN";
  direction: "CONG" | "TRU";
  amount: number;
  description: string;
  status: "THANHCONG" | "CHO" | "THATBAI";
  createdAt: string;
}

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  status: "CHỜ" | "HOÀN TẤT";
  person: string;
  date: string;
}

export interface Member {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  team: string;
}

export interface Team {
  _id: string;
  name: string;
  members: Member[];
}

export interface SplitMember {
  name: string;
  paid: number;
}

export interface Split {
  _id: string;
  members: SplitMember[];
  total: number;
  date: string;
}

/* ================== Dữ liệu toàn cục ================== */
export interface GlobalData {
  wallet: WalletInfo | null;
  transactions: Transaction[];
  teams: Team[];
  expenses: Expense[];
  members: Member[];
  splits: Split[];
}

/* ================== Context Type ================== */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  globalData: GlobalData | null;
}

/* ================== Config ================== */
const API_BASE = "http://localhost:8080/api";

/* ================== Tạo Context ================== */
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => undefined,
  logout: () => undefined,
  refreshUserData: async () => undefined,
  globalData: null,
});

/* ================== Component chính ================== */
export const AuthProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);

  useEffect(() => {
    const init = async (): Promise<void> => {
      const storedUser = localStorage.getItem("user");
      const cookieToken = getCookie("accessToken") as string | undefined;

      console.log("[Init] Cookie Token:", cookieToken);
      console.log("[Init] Stored User:", storedUser);

      if (storedUser && cookieToken) {
        try {
          const parsed: User = JSON.parse(storedUser);
          const normalized: User = {
            _id: parsed._id || parsed.id || "",
            username: parsed.username,
            email: parsed.email,
            token: cookieToken,
            role: parsed.role,
          };

          if (normalized._id && cookieToken) {
            console.log("[Init] Đã khôi phục user:", normalized.username);
            console.log("[Init] ID:", normalized._id);
            setUser(normalized);
            axios.defaults.headers.common["Authorization"] = `Bearer ${cookieToken}`;
            await loadGlobalData(normalized._id);
          } else {
            console.warn("[Init] Không tìm thấy userId hoặc token hợp lệ.");
            localStorage.clear();
            deleteCookie("accessToken");
          }
        } catch {
          console.error("[Init] Parse user từ localStorage thất bại!");
          localStorage.clear();
          deleteCookie("accessToken");
        }
      }
      setLoading(false);
    };

    void init();
  }, []);

  const login = async (userData: User): Promise<void> => {
    const normalized: User = {
      ...userData,
      _id: userData._id || userData.id || "",
    };

    if (!normalized.token) {
      message.error("Không có token trả về từ server.");
      console.error("[Login] Server không trả token!");
      return;
    }

    setCookie("accessToken", normalized.token, { maxAge: 7 * 24 * 60 * 60 });
    localStorage.setItem("user", JSON.stringify(normalized));
    localStorage.setItem("token", normalized.token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${normalized.token}`;
    setUser(normalized);

    console.log("[Login] Token đã lưu:", normalized.token);
    console.log("[Login] ID người dùng:", normalized._id);
    console.log("[Login] Username:", normalized.username);

    message.success(`Xin chào ${normalized.username}`);
    await loadGlobalData(normalized._id);
  };

  const logout = (): void => {
    console.log("[Logout] Xóa token và user.");
    setUser(null);
    setGlobalData(null);
    localStorage.clear();
    deleteCookie("accessToken");
    delete axios.defaults.headers.common["Authorization"];
    message.info("Đã đăng xuất.");
  };

  const refreshUserData = async (): Promise<void> => {
    try {
      const token = getCookie("accessToken") as string | undefined;
      if (!token) {
        console.warn("[Refresh] Không tìm thấy token, đăng xuất!");
        return logout();
      }

      const res = await axios.get<{ user: User }>(`${API_BASE}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = res.data?.user;
      if (updatedUser) {
        console.log("[Refresh] Làm mới dữ liệu user:", updatedUser.username);
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        await loadGlobalData(updatedUser._id);
      }
    } catch (err) {
      console.error("[Refresh] Lỗi khi làm mới dữ liệu:", err);
      logout();
    }
  };

  const loadGlobalData = async (userId: string): Promise<void> => {
    try {
      console.log("[LoadData] Đang tải dữ liệu cho userId:", userId);

      const [walletRes, transRes, teamRes, expenseRes, memberRes, splitRes] =
        await Promise.all([
          axios.get<WalletInfo>(`${API_BASE}/wallet/info`, { params: { userId } }),
          axios.get<{ success: boolean; transactions: Transaction[] }>(
            `${API_BASE}/wallet/transactions`,
            { params: { userId } }
          ),
          axios.get<Team[]>(`${API_BASE}/teams`),
          axios.get<Expense[]>(`${API_BASE}/expenses`),
          axios.get<Member[]>(`${API_BASE}/members`),
          axios.get<Split[]>(`${API_BASE}/splits`),
        ]);

      const newData: GlobalData = {
        wallet: walletRes.data,
        transactions: transRes.data.transactions || [],
        teams: teamRes.data,
        expenses: expenseRes.data,
        members: memberRes.data,
        splits: splitRes.data,
      };

      console.log("[LoadData] Ví:", newData.wallet?.balance);
      console.log("[LoadData] Số giao dịch:", newData.transactions.length);

      setGlobalData(newData);
      localStorage.setItem("globalData", JSON.stringify(newData));
    } catch (error) {
      console.warn("[LoadData] Không thể tải dữ liệu toàn hệ thống:", error);
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

export const useAuth = (): AuthContextType => useContext(AuthContext);
