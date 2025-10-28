// src/utils/authStore.ts

export interface AuthUser {
  id: number;
  name: string;
  role: "customer" | "admin";
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";

/**
 * ✅ Quản lý session đăng nhập (Token + User Info)
 */
export const authStore = {
  /**
   * ✅ Lưu token và thông tin user vào localStorage
   */
  saveSession: (token: string, user: AuthUser): void => {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("❌ Lỗi khi lưu session:", error);
    }
  },

  /**
   * ✅ Lấy token JWT từ localStorage
   */
  getToken: (): string | null => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("❌ Lỗi khi lấy token:", error);
      return null;
    }
  },

  /**
   * ✅ Lấy thông tin user hiện tại
   */
  getUser: (): AuthUser | null => {
    try {
      const data = localStorage.getItem(AUTH_USER_KEY);
      return data ? (JSON.parse(data) as AuthUser) : null;
    } catch (error) {
      console.error("❌ Lỗi khi parse user:", error);
      return null;
    }
  },

  /**
   * ✅ Kiểm tra xem người dùng đã đăng nhập chưa
   */
  isAuthenticated: (): boolean => {
    return !!authStore.getToken();
  },

  /**
   * ✅ Xóa token và thông tin user khỏi localStorage
   */
  clear: (): void => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (error) {
      console.error("❌ Lỗi khi xóa session:", error);
    }
  },
};
