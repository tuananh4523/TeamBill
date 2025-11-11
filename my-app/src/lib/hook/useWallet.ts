import { useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { message } from "antd";
import { getWallets, getWalletById, IWallet } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

/* ======================== KIỂU DỮ LIỆU ======================== */
interface ApiError {
  message?: string;
  error?: string;
}

export interface WalletResponse {
  message: string;
  data: IWallet;
}

/* ===========================================================
   HOOK: LẤY THÔNG TIN VÍ CỦA USER ĐĂNG NHẬP
=========================================================== */
export const useUserWallet = () => {
  const { user } = useAuth();

  return useQuery<WalletResponse, AxiosError<ApiError>>({
    queryKey: ["userWallet", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<WalletResponse> => {
      if (!user?.id) throw new Error("Chưa đăng nhập.");

      console.groupCollapsed(
        `%c[Wallet] Bắt đầu tải ví cho userId=${user.id}`,
        "color:#888"
      );
      const start = performance.now();

      try {
        // 1. Lấy tất cả ví
        const { data: allWallets } = await getWallets();

        // 2. Tìm ví cá nhân của user
        const userWallet = allWallets.find((wallet) => {
          const walletUserId =
            (
              wallet.userId as { _id?: string; toString?: () => string }
            )?.toString?.() || (wallet.userId as string);
          return walletUserId === user.id;
        });

        if (!userWallet) throw new Error("Không tìm thấy ví của người dùng.");

        // 3. Lấy chi tiết ví
        const walletId = userWallet.id || userWallet._id || "";
        const response: AxiosResponse<IWallet | WalletResponse> =
          await getWalletById(walletId);

        // ✅ Kiểm tra xem response có field data/message không
        let walletResponse: WalletResponse;
        const data = response.data;

        if ("data" in data && "message" in data) {
          walletResponse = data as WalletResponse;
        } else {
          walletResponse = {
            message: "Lấy thông tin ví thành công",
            data: data as IWallet,
          };
        }

        // Bổ sung fallback cho các trường số
        walletResponse.data = {
          ...walletResponse.data,
          balance: walletResponse.data.balance ?? 0,
          totalDeposit: walletResponse.data.totalDeposit ?? 0,
          totalWithdraw: walletResponse.data.totalWithdraw ?? 0,
        };

        console.log("[Wallet] API response:", walletResponse);

        const end = performance.now();
        console.log(
          `%c[Wallet] Hoàn tất trong ${(end - start).toFixed(2)}ms`,
          "color:#0a0"
        );
        console.groupEnd();

        return walletResponse;
      } catch (error) {
        const err = error as AxiosError<ApiError>;
        console.error("[Wallet] Lỗi:", err.response?.data || err.message);
        message.error(err.response?.data?.message || "Không thể tải thông tin ví");
        console.groupEnd();
        throw err;
      }
    },
  });
};
