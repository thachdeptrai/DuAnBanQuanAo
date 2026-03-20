/**
 * ✅ axiosClient.ts — Chuẩn hoá cho Admin (React + Vite + TypeScript)
 *
 * - Tự động lấy baseURL từ .env (VITE_API_URL)
 * - Gắn token từ localStorage
 * - Xử lý lỗi 401 → xóa token + chuyển về /login
 * - Timeout 15s, log debug URL và token
 */
import axios, { type AxiosInstance, type AxiosError } from "axios"; // ✅ Chỉ giữ những type cần


/* ----------------------------------------------------
 * 1️⃣ Lấy baseURL từ .env (chuẩn cho Vite)
 * ---------------------------------------------------- */
const API_BASE_URL = (() => {
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, ""); // bỏ dấu "/" dư ở cuối
  if (typeof window !== "undefined") return window.location.origin + "/api";
  return "http://localhost:4000/api"; // fallback nếu không có .env
})();

console.log("🚀 Admin axiosClient BASE_URL =", API_BASE_URL);

/* ----------------------------------------------------
 * 2️⃣ Tạo instance Axios
 * ---------------------------------------------------- */
const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 giây timeout
});

/* ----------------------------------------------------
 * 3️⃣ Gắn token vào mọi request (nếu có)
 * ---------------------------------------------------- */
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    config.headers = config.headers || {}; // đảm bảo không undefined
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    console.log("🔑 Sending request to:", config.url, "with token:", token);
    return config;
  },
  (error) => Promise.reject(error)
);


/* ----------------------------------------------------
 * 4️⃣ Xử lý lỗi response (401, network,...)
 * ---------------------------------------------------- */
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      // 🔒 Token hết hạn hoặc không hợp lệ
      if (status === 401) {
        console.warn("🔒 Token hết hạn — Tự động đăng xuất admin.");
        localStorage.removeItem("token");
        localStorage.removeItem("user"); // nếu lưu user
        window.location.href = "/login"; // redirect về login
      }

      const message =
        (error.response.data as any)?.message ||
        `Lỗi ${status}: ${error.response.statusText}`;

      return Promise.reject({ ...error, message });
    }

    if (error.request) {
      return Promise.reject({ message: "Không thể kết nối đến máy chủ." });
    }

    return Promise.reject(error);
  }
);

/* ----------------------------------------------------
 * 5️⃣ Kiểu dữ liệu chuẩn cho phản hồi
 * ---------------------------------------------------- */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/* ----------------------------------------------------
 * 6️⃣ Export default
 * ---------------------------------------------------- */
export default axiosClient;
