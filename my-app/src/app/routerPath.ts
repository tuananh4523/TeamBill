// routerPath.ts
export const ROUTER_PATH = {
  // ===== Dashboard / Trang chủ =====
  DASHBOARD: "/dashboard",

  // ===== Quản lý chi tiêu =====
  EXPENSES: "/expenses", // Trang quản lý chi tiêu tổng
  PAYMENTS: "/payments", // Giao dịch, thanh toán riêng

  // ===== Ví điện tử =====
  WALLET: {
    WALLET: "/wallet",
    TRANSACTIONS: "/wallet/transactions",
    DEPOSIT: "/wallet/deposit",
    WITHDRAW: "/wallet/withdraw",
  },

  // ===== Nhóm & Bạn bè =====
  TEAMS: "/teams",
  FRIENDS: "/friends",
  TEAM_DETAIL: (teamId: string) => `/teams/${teamId}`,
  TEAM_MEMBERS: (teamId: string) => `/teams/${teamId}/members`,

  // ===== Danh mục =====
  CATEGORIES: "/categories",
  CATEGORY_DETAIL: (categoryId: string) => `/categories/${categoryId}`,

  // ===== Ghi chép (Split bill) =====
  SPLIT: {
    DANH_SACH: "/split",
    NHOM: (teamId: string) => `/split/${teamId}`,
    SU_KIEN: (teamId: string, eventId: string) => `/split/${teamId}/event/${eventId}`,
    THEM_MOI: "/split/create",
  },

  // ===== Báo cáo & Tổng kết =====
  SUMMARY: "/summary",
  REPORTS: "/reports",
  RECORDS: "/records",

  // ===== Cấu hình hệ thống =====
  SETTINGS: "/settings",
  PROFILE: "/profile",

  // ===== Trang mặc định / fallback =====
  HOME: "/",
  NOT_FOUND: "/404",
} as const;
