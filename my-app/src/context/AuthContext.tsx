"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  ReactElement,
} from "react";
import { message } from "antd";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import axios from "../lib/axiosConfig"

/* ================== Kiểu dữ liệu ================== */
export interface User {
  _id?: string; // backend có thể trả _id hoặc id
  id?: string;
  username: string;
  email?: string;
  token?: string;
  role?: string;
}

export interface WalletInfo {
  _id?: string;
  soDu: number;
  maThamChieu: string;
  thongTinNganHang_tenNganHang: string;
  thongTinNganHang_soTaiKhoan: string;
}

export interface Transaction {
  _id: string;
  walletId: string;
  code: string;
  type: "NAP" | "RUT" | "CHUYEN" | "THANHTOAN";
  direction: "CONG" | "TRU";
  amount: number;
  description?: string;
  status: "THANHCONG" | "CHO" | "THATBAI";
  date: string;
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
  owed?: number;
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
  login: (data: { token: string; user: User }) => Promise<void>;
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
export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);

  /* ================== Khôi phục đăng nhập ================== */
  useEffect(() => {
    const restoreSession = async (): Promise<void> => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = getCookie("accessToken") as string | null;

        if (storedUser && token) {
          const parsed = JSON.parse(storedUser) as User;
          const normalizedUser: User = {
            _id: parsed._id ?? parsed.id ?? "",
            id: parsed._id ?? parsed.id ?? "",
            username: parsed.username,
            email: parsed.email,
            role: parsed.role,
            token,
          };

          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setUser(normalizedUser);
          await loadGlobalData(normalizedUser._id || "");
        }
      } catch (err) {
        console.error("[Auth] Khôi phục thất bại:", err);
        handleSessionInvalid();
      } finally {
        setLoading(false);
      }
    };

    void restoreSession();
  }, []);

  /* ================== Đăng nhập ================== */
  const login = async (resData: {
    token: string;
    user: User;
  }): Promise<void> => {
    const { token, user: rawUser } = resData;

    if (!token) {
      message.error("Không có token trả về từ server.");
      return;
    }

    // Chuẩn hóa user id (_id hoặc id)
    const normalizedUser: User = {
      _id: rawUser._id ?? rawUser.id ?? "",
      id: rawUser._id ?? rawUser.id ?? "",
      username: rawUser.username,
      email: rawUser.email,
      role: rawUser.role,
      token,
    };

    // Lưu token + user vào cookie và localStorage
    setCookie("accessToken", token, { maxAge: 7 * 24 * 60 * 60 });
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));

    // Cấu hình axios
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(normalizedUser);

    message.success(`Xin chào ${normalizedUser.username}`);
    await loadGlobalData(normalizedUser._id || "");
  };

  /* ================== Đăng xuất ================== */
  const logout = (): void => {
    console.log("[Logout] Xóa token và user.");
    setUser(null);
    setGlobalData(null);
    localStorage.clear();
    deleteCookie("accessToken");
    delete axios.defaults.headers.common["Authorization"];
    message.info("Đã đăng xuất.");
  };

  /* ================== Phiên không hợp lệ ================== */
  const handleSessionInvalid = (): void => {
    localStorage.clear();
    deleteCookie("accessToken");
    setUser(null);
    setGlobalData(null);
  };

  /* ================== Làm mới user ================== */
  const refreshUserData = async (): Promise<void> => {
    try {
      const token = getCookie("accessToken") as string | undefined;
      if (!token) return logout();

      const res = await axios.get<{ user: User }>(`${API_BASE}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = res.data?.user;
      if (updatedUser) {
        const normalizedUser: User = {
          _id: updatedUser._id ?? updatedUser.id ?? "",
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          token,
        };

        setUser(normalizedUser);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        await loadGlobalData(normalizedUser._id || "");
      }
    } catch (err) {
      console.error("[Refresh] Lỗi khi làm mới dữ liệu:", err);
      logout();
    }
  };

  /* ================== Tải dữ liệu toàn hệ thống ================== */
  const loadGlobalData = async (userId: string): Promise<void> => {
    if (!userId) return;
    try {
      const [walletRes, transRes, teamRes, expenseRes, memberRes, splitRes] =
        await Promise.all([
          axios.get(`${API_BASE}/wallet/info`, { params: { userId } }),
          axios.get(`${API_BASE}/wallet/transactions`, { params: { userId } }),
          axios.get(`${API_BASE}/teams`),
          axios.get(`${API_BASE}/expenses`),
          axios.get(`${API_BASE}/members`),
          axios.get(`${API_BASE}/splits`),
        ]);

      const newData: GlobalData = {
        wallet: walletRes.data,
        transactions: transRes.data.data || [],
        teams: teamRes.data,
        expenses: expenseRes.data,
        members: memberRes.data,
        splits: splitRes.data,
      };

      setGlobalData(newData);
      localStorage.setItem("globalData", JSON.stringify(newData));
    } catch (error) {
      console.warn("[LoadData] Không thể tải dữ liệu:", error);
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
