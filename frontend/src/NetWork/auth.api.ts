/**
 * ✅ auth.api.ts — Phiên bản Chuẩn Hóa Đồng bộ với Backend
 * Chỉ bao gồm các API mà user thường có thể tương tác
 */

import { apiClient } from "./apiClient";
import type { ApiResponse } from "./apiClient";
import { saveUserSession, clearUserSession, type UserSession } from "../utils/session";

// ----------------------------------------------------
// 🔹 1. Định nghĩa Kiểu Dữ Liệu (Models)
// ----------------------------------------------------

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterRequestData {
  email: string;
}

export interface RegisterFinalizeData {
  email: string;
  password: string;
  otp: string; // Mã OTP
}

// ✅ THÊM: Interface cho Verify OTP
export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface UserData {
  id: number | string;
  email: string;
  role: "customer" | "admin";
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  status?: "active" | "inactive" | "deleted";
  email_verified?: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponseData {
  user: UserData;
  accessToken: string;
  expiresIn?: string;
  refreshToken?: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: string;
  user: UserData;
}

// ----------------------------------------------------
// 🔹 2. API: Yêu cầu OTP Đăng ký
// ----------------------------------------------------
export const requestOtpForRegistration = async (
  email: string
): Promise<ApiResponse> => {
  console.log("📧 [AUTH] Request OTP for registration:", email);

  const result = await apiClient("/auth/register/request-otp", {
    method: "POST",
    body: { email },
  });

  if (result.success && !result.message) {
    result.message = "Mã OTP đã được gửi đến email. Vui lòng kiểm tra hộp thư.";
  }

  return result;
};

// ----------------------------------------------------
// 🔹 3. API: Hoàn tất Đăng ký với OTP
// ----------------------------------------------------
export const registerWithOtp = async (
  data: RegisterFinalizeData
): Promise<ApiResponse<{ id: number; email: string; role: string }>> => {
  console.log("📤 [AUTH] Register with OTP:", data);

  const result = await apiClient<{ id: number; email: string; role: string }>(
    "/auth/register/finalize",
    {
      method: "POST",
      body: data,
    }
  );

  if (result.success && !result.message) {
    result.message = "Đăng ký tài khoản thành công! Vui lòng đăng nhập.";
  }

  return result;
};

// ----------------------------------------------------
// 🔹 4. API: Đăng nhập
// ----------------------------------------------------
export const login = async (
  credentials: LoginCredentials
): Promise<ApiResponse<AuthResponseData>> => {
  console.log("🔐 [AUTH] Login request:", credentials.email);

  const result = await apiClient<AuthResponseData>("/auth/login", {
    method: "POST",
    body: credentials,
  });

  console.log("📥 [AUTH] Login response:", result);

  if (result.success && result.data) {
    const { accessToken, user } = result.data;

    // ✅ Lưu session
    const sessionData: UserSession = {
      token: accessToken,
      name: user.name || user.email,
      email: user.email,
      phone: user.phone,
      role: user.role as "customer" | "admin", // ✅ Ép kiểu cho đúng
      id: user.id,
      avatar: user.avatar,
    };
    saveUserSession(sessionData);
  }

  if (result.success && !result.message) {
    result.message = "Đăng nhập thành công!";
  }

  return result;
};

// ----------------------------------------------------
// 🔹 5. API: Quên Mật khẩu - Gửi OTP
// ----------------------------------------------------
export const forgotPassword = async (
  email: string
): Promise<ApiResponse> => {
  console.log("📧 [AUTH] Forgot Password - Send OTP:", email);

  const result = await apiClient("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });

  if (result.success && !result.message) {
    result.message = "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.";
  }

  return result;
};



// ----------------------------------------------------
// 🔹 6. API: Đặt lại Mật khẩu (Verify OTP + Reset trong 1 lần)
// ----------------------------------------------------
export const resetPassword = async (
  data: ResetPasswordData
): Promise<ApiResponse> => {
  console.log("🔄 [AUTH] Reset Password:", data.email);

  const result = await apiClient("/auth/reset-password", {
    method: "POST",
    body: data,
  });

  if (result.success && !result.message) {
    result.message = "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.";
  }

  return result;
};

// ----------------------------------------------------
// 🔹 8. API: Đổi Mật khẩu (Khi đã đăng nhập)
// ----------------------------------------------------
export const changePassword = async (
  data: ChangePasswordData
): Promise<ApiResponse> => {
  console.log("🔑 [AUTH] Change Password");

  const result = await apiClient("/auth/change-password", {
    method: "POST",
    body: data,
  });

  if (result.success && !result.message) {
    result.message = "Đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới cho lần đăng nhập tiếp theo.";
  }

  return result;
};

// ----------------------------------------------------
// 🔹 9. API: Refresh Token
// ----------------------------------------------------
export const refreshToken = async (): Promise<ApiResponse<RefreshTokenResponse>> => {
  console.log("🔄 [AUTH] Refresh Token");

  const result = await apiClient<RefreshTokenResponse>("/auth/refresh-token", {
    method: "POST",
  });

  if (result.success && result.data) {
    const { accessToken, user } = result.data;

    // ✅ Cập nhật session với token mới
    const sessionData: UserSession = {
      token: accessToken,
      name: user.name || user.email,
      email: user.email,
      phone: user.phone,
      role: user.role as "customer" | "admin", // ✅ Ép kiểu cho đúng
      id: user.id,
      avatar: user.avatar,
    };
    saveUserSession(sessionData);
  }

  return result;
};

// ----------------------------------------------------
// 🔹 10. API: Đăng xuất
// ----------------------------------------------------
export const logout = async (): Promise<ApiResponse> => {
  console.log("🚪 [AUTH] Logout");

  const result = await apiClient("/auth/logout", {
    method: "POST"
  });

  // ✅ Luôn clear session khi logout (dù API có thành công hay không)
  clearUserSession();

  if (result.success && !result.message) {
    result.message = "Đăng xuất thành công!";
  }

  return result;
};

// ----------------------------------------------------
// 🔹 11. API: Lấy thông tin user hiện tại
// ----------------------------------------------------
export const getCurrentUser = async (): Promise<ApiResponse<UserData>> => {
  console.log("👤 [AUTH] Get Current User");

  return await apiClient<UserData>("/auth/me", {
    method: "GET",
  });
};