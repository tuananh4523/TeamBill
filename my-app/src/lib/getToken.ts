import { getCookie } from "cookies-next";

/** Lấy token cho API: ưu tiên cookie (AuthContext), fallback localStorage (AuthModal). */
export function getToken(): string {
  if (typeof window === "undefined") return "";
  return (getCookie("accessToken") as string) || localStorage.getItem("token") || "";
}
