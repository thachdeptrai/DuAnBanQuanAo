// src/utils/session.ts

export interface UserSession {
  token: string;
  name: string;
  email: string;
  phone?: string;
}

/**
 * ✅ Lưu thông tin người dùng vào localStorage
 */
export const saveUserSession = (data: UserSession): void => {
  if (typeof window === "undefined") return; // tránh lỗi khi chạy SSR
  try {
    localStorage.setItem("user_session", JSON.stringify(data));
  } catch (error) {
    console.error("Lỗi khi lưu user_session:", error);
  }
};

/**
 * ✅ Lấy thông tin người dùng từ localStorage
 */
export const getUserSession = (): UserSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem("user_session");
    return data ? (JSON.parse(data) as UserSession) : null;
  } catch (error) {
    console.error("Lỗi khi đọc user_session:", error);
    return null;
  }
};

/**
 * ✅ Xóa thông tin người dùng khỏi localStorage
 */
export const clearUserSession = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("user_session");
  } catch (error) {
    console.error("Lỗi khi xóa user_session:", error);
  }
};

/**
 * ✅ Cập nhật một phần thông tin người dùng
 * (Ví dụ: chỉ cập nhật tên hoặc số điện thoại)
 */
export const updateUserSession = (partialData: Partial<UserSession>): void => {
  if (typeof window === "undefined") return;
  try {
    const current = getUserSession();
    if (!current) return;
    const updated = { ...current, ...partialData };
    saveUserSession(updated);
  } catch (error) {
    console.error("Lỗi khi cập nhật user_session:", error);
  }
};
