/**
 * ✅ apiClient.ts — Phiên bản Chuẩn Hóa Cuối Cùng (Dành cho Vite)
 *
 * - Tự động lấy BaseURL từ .env (VITE_API_URL)
 * - Tự động gắn token vào Header
 * - Tự động stringify body
 * - Xử lý lỗi 401, clear session
 * - Tối ưu cho TypeScript + Vite
 */

import { getUserSession, clearUserSession } from "../utils/session";

/* ----------------------------------------------------
 * 1️⃣ HÀM LẤY TOKEN
 * ---------------------------------------------------- */
const getToken = (): string | null => {
  const session = getUserSession();
  return session?.token || null;
};

/* ----------------------------------------------------
 * 2️⃣ BASE URL — CHUẨN CHO VITE
 * ---------------------------------------------------- */
// ⚠️ Vite không dùng process.env mà dùng import.meta.env
const API_BASE_URL = (() => {
  const envUrl = import.meta.env?.VITE_API_URL;

  if (envUrl) return envUrl.replace(/\/$/, "");

  // fallback khi không có biến môi trường
  if (typeof window !== "undefined") {
    return window.location.origin + "/api";
  }

  return "http://localhost:4000/api";
})();

console.log("🚀 API_BASE_URL =", API_BASE_URL);

/* ----------------------------------------------------
 * 3️⃣ ĐỊNH NGHĨA KIỂU DỮ LIỆU CHUNG
 * ---------------------------------------------------- */
export interface ApiResponse<T = any> {
  error: any;
  success: boolean;
  message: string;
  details?: string[];
  data?: T;
}

interface RequestOptions extends RequestInit {
  body?: any;
}

/* ----------------------------------------------------
 * 4️⃣ HÀM XỬ LÝ PHẢN HỒI
 * ---------------------------------------------------- */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  let data: any;
  try {
    data = await response.json();
  } catch {
    data = { message: response.statusText };
  }

  if (!response.ok) {
    const message = data?.message || `HTTP ${response.status}: ${response.statusText}`;

    // Nếu token hết hạn hoặc không hợp lệ → clear session
    if (response.status === 401) {
      clearUserSession();
      console.warn("🔒 Token hết hạn hoặc không hợp lệ — đã xóa session cục bộ.");

    }

    return {
      success: false,
      error: data?.error ?? true,
      message,
      details: data?.details || [],
      data: data?.data || null,
    };
  }

  return {
    success: true,
    error: null,
    message: data?.message || "Thành công.",
    data: data?.data ?? data,
  };
};

/* ----------------------------------------------------
 * 5️⃣ HÀM GỌI API CHÍNH
 * ---------------------------------------------------- */
export const apiClient = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const finalOptions: RequestInit = {
    ...options,
    headers,
    body:
      options.body && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body,
  };

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // 🔑 DEBUG: log token và URL trước khi gửi request
  console.log("🔑 Sending request to:", url, "with token:", token);

  try {
    const response = await fetch(url, finalOptions);
    return await handleResponse<T>(response);
  } catch (error) {
    console.error("🌐 Lỗi mạng:", error);
    return {
      success: false,
      error: true,
      message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
      details: [],
    };
  }
};


/* ----------------------------------------------------
 * 6️⃣ EXPORT
 * ---------------------------------------------------- */
export { getToken };
