// src/utils/session.ts

export interface UserSession {
  token: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin"; // ✅ Thêm role theo đúng backend
  id: number | string;
  avatar?: string;
}

/**
 * ✅ Lưu thông tin người dùng vào localStorage
 */
export const saveUserSession = (data: UserSession): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("user_session", JSON.stringify(data));
    console.log("💾 Session saved:", data.email);
  } catch (error) {
    console.error("❌ Lỗi khi lưu user_session:", error);
  }
};

/**
 * ✅ Lấy thông tin người dùng từ localStorage
 */
export const getUserSession = (): UserSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem("user_session");
    if (!data) return null;

    const session = JSON.parse(data) as UserSession;
    console.log("📖 Session loaded:", session.email);
    return session;
  } catch (error) {
    console.error("❌ Lỗi khi đọc user_session:", error);
    return null;
  }
};

/**
 * ✅ Xóa thông tin người dùng khỏi localStorage
 */
export const clearUserSession = (): void => {
  if (typeof window === "undefined") return;
  try {
    const currentSession = getUserSession();
    localStorage.removeItem("user_session");
    console.log("🗑️ Session cleared for:", currentSession?.email || "unknown");
  } catch (error) {
    console.error("❌ Lỗi khi xóa user_session:", error);
  }
};

/**
 * ✅ Cập nhật một phần thông tin người dùng
 */
export const updateUserSession = (partialData: Partial<UserSession>): void => {
  if (typeof window === "undefined") return;
  try {
    const current = getUserSession();
    if (!current) {
      console.warn("⚠️ Không có session để cập nhật");
      return;
    }

    const updated = { ...current, ...partialData };
    saveUserSession(updated);
    console.log("🔄 Session updated:", partialData);
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật user_session:", error);
  }
};

/**
 * ✅ Kiểm tra xem user có phải admin không
 */
export const isAdmin = (): boolean => {
  const session = getUserSession();
  return session?.role === "admin";
};

/**
 * ✅ Kiểm tra xem user có đăng nhập không
 */
export const isAuthenticated = (): boolean => {
  return getUserSession() !== null;
};

/**
 * ✅ Lấy token từ session
 */
export const getToken = (): string | null => {
  return getUserSession()?.token || null;
};