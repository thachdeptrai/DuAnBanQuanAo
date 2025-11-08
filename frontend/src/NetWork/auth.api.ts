/**
 * ✅ auth.api.ts — Phiên bản Chuẩn Hóa Cuối Cùng
 * Đồng bộ 100% với backend NestJS / Express
 */

import { apiClient } from "./apiClient";
import type { ApiResponse } from "./apiClient";
import { saveUserSession, clearUserSession } from "../utils/session";
import type { UserSession } from "../utils/session";

// ----------------------------------------------------
// 🔹 1. Định nghĩa Kiểu Dữ Liệu (Models)
// ----------------------------------------------------

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterRequestData extends LoginCredentials {
  name: string;
}

interface RegisterFinalizeData extends RegisterRequestData {
  code: string; // Mã OTP
}

interface AuthResponseData {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: "customer" | "admin";
  };
}

interface ResetPasswordData {
  token: string;
  newPassword: string;
}

// ----------------------------------------------------
// 🔹 2. API: Yêu cầu OTP khi Đăng ký (Bước 1)
// ----------------------------------------------------
export const requestRegistrationOtp = async (
  data: RegisterRequestData
): Promise<ApiResponse> => {
  console.log("📤 [AUTH] Request OTP:", data);

  const result = await apiClient("/auth/register/request-otp", {
    method: "POST",
    body: data,
  });

  if (result.success && !result.message) {
    result.message = "Mã OTP đã được gửi đến email. Vui lòng kiểm tra hộp thư.";
  }

  return result;
};

// ----------------------------------------------------
// 🔹 3. API: Hoàn tất Đăng ký (Bước 2)
// ----------------------------------------------------
export const finalizeRegistration = async (
  data: RegisterFinalizeData
): Promise<ApiResponse> => {
  console.log("📤 [AUTH] Finalize Register:", data);

  const result = await apiClient("/auth/register/finalize", {
    method: "POST",
    body: data,
  });

  if (result.success && !result.message) {
    result.message = "Đăng ký tài khoản thành công!";
  }

  return result;
};

// ----------------------------------------------------
// 🔹 4. API: Đăng nhập (POST /api/auth/login)
// ----------------------------------------------------
export const login = async (
  credentials: LoginCredentials
): Promise<ApiResponse<AuthResponseData>> => {
  console.log("📤 [AUTH] Login request:", credentials);

  const result = await apiClient<AuthResponseData>("/auth/login", {
    method: "POST",
    body: credentials,
  });

  console.log("📥 [AUTH] Login response:", result);

  if (result.success && !result.message) {
    result.message = "Đăng nhập thành công.";
  }

  // ✅ Lưu session nếu login thành công
  if (result.success && result.data) {
    const { token, user } = result.data;
    const sessionData: UserSession = {
      token,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };
    saveUserSession(sessionData);
  }

  return result;
};

// ----------------------------------------------------
// 🔹 5. API: Quên Mật khẩu
// ----------------------------------------------------
export const forgotPassword = async (
  email: string
): Promise<ApiResponse> => {
  console.log("📤 [AUTH] Forgot Password:", email);

  const result = await apiClient("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });

  if (result.success && !result.message) {
    result.message =
      "Đường link đặt lại mật khẩu đã được gửi đến email của bạn.";
  }

  return result;
};

// ----------------------------------------------------
// 🔹 6. API: Đặt lại Mật khẩu
// ----------------------------------------------------
export const resetPassword = async (
  data: ResetPasswordData
): Promise<ApiResponse> => {
  const result = await apiClient("/auth/reset-password", {
    method: "POST",
    body: data,
  });

  if (result.success && !result.message) {
    result.message = "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.";
  }

  return result;
};

// ----------------------------------------------------
// 🔹 7. API: Đổi Mật khẩu
// ----------------------------------------------------
export const changePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<ApiResponse> => {
  const result = await apiClient("/auth/change-password", {
    method: "POST",
    body: { oldPassword, newPassword },
  });

  if (result.success && !result.message) {
    result.message = "Mật khẩu đã được đổi thành công!";
  }

  return result;
};

// ----------------------------------------------------
// 🔹 8. API: Đăng xuất
// ----------------------------------------------------
export const logout = async (): Promise<ApiResponse> => {
  const result = await apiClient("/auth/logout", { method: "POST" });

  if (result.success) {
    clearUserSession();
    result.message ||= "Đã đăng xuất thành công.";
  }

  return result;
};
