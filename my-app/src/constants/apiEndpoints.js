// src/constants/apiEndpoints.js
export const API_ENDPOINTS = Object.freeze({
  // ===== USER =====
  USER_SIGNUP: "/api/user/signup",
  USER_SIGNIN: "/api/user/signin",
  USER_SEARCH: "/api/users/search",

  // ===== WALLET =====
  WALLET_CREATE: "/api/wallet/create",
  WALLET_INFO: "/api/wallet/info",
  WALLET_TRANSACTIONS: "/api/wallet/transactions",
  WALLET_DEPOSIT: "/api/wallet/deposit",
  WALLET_WITHDRAW: "/api/wallet/withdraw",
  WALLET_QR: "/api/wallet/qr",

  // ===== TEAM =====
  TEAMS: "/api/teams",
  TEAM_DETAIL: (id) => `/api/teams/${id}`,
  TEAM_ADD_MEMBER: (id) => `/api/teams/${id}/members`,

  // ===== MEMBER =====
  MEMBERS: "/api/members",
  MEMBER_DETAIL: (id) => `/api/members/${id}`,

  // ===== EXPENSE =====
  EXPENSES: "/api/expenses",
  EXPENSE_DETAIL: (id) => `/api/expenses/${id}`,
  EXPENSE_SUMMARY: "/api/expenses/summary",

  // ===== SPLIT =====
  SPLITS: "/api/splits",
  SPLIT_DETAIL: (id) => `/api/splits/${id}`,
  SPLIT_SUMMARY: "/api/splits/summary",

  // ===== DASHBOARD =====
  DASHBOARD_SUMMARY: "/api/dashboard/summary",
});
