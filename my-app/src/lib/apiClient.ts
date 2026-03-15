import { API_URL } from "@/config/index";
import { getToken } from "@/lib/getToken";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, token = getToken() } = options;
  const url = `${API_URL}${endpoint}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type");
  let data: unknown;
  try {
    data = contentType?.includes("application/json")
      ? await res.json()
      : await res.text().then((t) => (t ? { message: t } : {}));
  } catch {
    throw new Error(
      `API không trả JSON. Kiểm tra server đang chạy đúng port (vd: 8080). URL: ${url}`
    );
  }

  if (!res.ok) {
    const msg = (data as { message?: string })?.message || `Lỗi ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}
