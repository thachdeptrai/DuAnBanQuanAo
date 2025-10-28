/**
 * ✅ apiClient.ts — Phiên bản Chuẩn Hóa Cuối Cùng
 */

// ⭐ 1. IMPORT CÁC HÀM QUẢN LÝ SESSION CHUẨN CỦA BẠN
import { getUserSession, clearUserSession } from "../utils/session"; 
// ^^^ Giữ nguyên đường dẫn này nếu cấu trúc thư mục của bạn là `src/NetWork` và `src/utils`

/* eslint-disable no-undef */
declare const process: {
  env: Record<string, string | undefined>;
};

// ----------------------------------------------------
// ⭐ 1. SỬA: Logic Lấy Token (Đã chính xác)
// ----------------------------------------------------

/** Lấy token từ object session đã lưu. */
const getToken = (): string | null => {
  const session = getUserSession();
  return session?.token || null;
};

// ----------------------------------------------------
// ⭐ 2. Cấu hình Base URL (Đã chính xác)
// ----------------------------------------------------
const API_BASE_URL = (() => {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin + "/api"; 
  }
  return "http://localhost:4000/api";
})();

// ----------------------------------------------------
// ⭐ 3. SỬA LỖI TYPESCRIPT (RequestOptions)
// ----------------------------------------------------

/** Generic API Response format (Giữ nguyên) */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  details?: string[];
  data?: T;
}

/** * Custom Request Options cho phép body là object.
 * ⭐ ĐÃ SỬA: extends RequestInit và ghi đè body
 */
interface RequestOptions extends RequestInit {
  body?: any;
}

// ----------------------------------------------------
// ⭐ 4. Logic Xử lý Phản hồi (handleResponse) - Đã chính xác
// ----------------------------------------------------
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  let data: any;
  try {
    data = await response.json();
  } catch {
    data = { message: response.statusText };
  }

  if (!response.ok) {
    const message = data?.message || `HTTP ${response.status}: ${response.statusText}`;

    if (response.status === 401) {
      // Dùng hàm xóa session chuẩn
      clearUserSession(); 
      console.warn("🔒 Token hết hạn hoặc không hợp lệ — đã xóa session cục bộ.");
    }

    return {
      success: false,
      message,
      details: data?.details || [],
      data: data?.data || null,
    };
  }

  return {
    success: true,
    message: data?.message || "Thành công.",
    data: data?.data ?? data,
  };
};

// ----------------------------------------------------
// ⭐ 5. Hàm gọi API tập trung (apiClient) - Đã chính xác
// ----------------------------------------------------
export const apiClient = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    // Tự động thêm Bearer token
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const finalOptions: RequestInit = {
    ...options,
    headers,
    // Tự động JSON.stringify body nếu là object
    body:
      options.body && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body,
  };

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, finalOptions);
    return await handleResponse<T>(response);
  } catch (error) {
    console.error("🌐 Lỗi mạng:", error);
    return {
      success: false,
      message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
      details: [],
    };
  }
};

// ----------------------------------------------------
// ⭐ 6. Export (Giữ đơn giản)
// ----------------------------------------------------

export { getToken };