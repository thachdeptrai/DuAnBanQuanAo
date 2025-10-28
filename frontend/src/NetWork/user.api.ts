// src/api/user.api.ts
import { apiClient } from "./apiClient";
import type { ApiResponse } from "./apiClient";

/**
 * Interface cho dữ liệu người dùng cơ bản (trừ mật khẩu)
 */
export interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    avatar: string | null;
    role: 'customer' | 'admin';
    status: 'active' | 'banned' | 'pending';
    created_at: string;
    updated_at: string;
}

/**
 * Interface cho dữ liệu cần thiết khi cập nhật
 */
export interface UpdateUserData {
    name?: string  | null;
    phone?: string | null;
    address?: string | null;
    avatar?: string | null;
}

/**
 * Interface cho body khi xóa tài khoản (yêu cầu mật khẩu)
 */
export interface DeleteSelfPayload {
    password: string;
}

// ==========================================================
// A. THAO TÁC CÁ NHÂN (PROFILE)
// ==========================================================

/**
 * Lấy thông tin cá nhân của người dùng hiện tại
 */
export const getProfile = (): Promise<ApiResponse<UserProfile>> => {
    return apiClient<UserProfile>('/users/me', {
        method: 'GET',
    });
};

/**
 * Cập nhật thông tin cá nhân của người dùng hiện tại
 */
export const updateProfile = (data: UpdateUserData): Promise<ApiResponse<UserProfile>> => {
    return apiClient<UserProfile>('/users/me', {
        method: 'PUT',
        body: data,
    });
};

/**
 * Người dùng tự xóa tài khoản của mình
 * @param data Object chứa { password } để xác nhận
 */
export const deleteSelfAccount = (data: DeleteSelfPayload): Promise<ApiResponse<null>> => {
    return apiClient<null>('/users/me', {
        method: 'DELETE',
        body: data,
    });
};

// ==========================================================
// B. THAO TÁC QUẢN TRỊ (ADMIN) - nếu sau này muốn mở rộng
// ==========================================================

/**
 * Lấy danh sách tất cả người dùng (Admin-only)
 */
export const getAllUsers = (): Promise<ApiResponse<UserProfile[]>> => {
    return apiClient<UserProfile[]>('/users', {
        method: 'GET',
    });
};

/**
 * Lấy thông tin chi tiết một người dùng bằng ID (Admin-only)
 */
export const getUserDetails = (userId: number | string): Promise<ApiResponse<UserProfile>> => {
    return apiClient<UserProfile>(`/users/${userId}`, {
        method: 'GET',
    });
};

/**
 * Admin xóa một người dùng bằng ID
 */
export const deleteUserById = (userId: number | string): Promise<ApiResponse<null>> => {
    return apiClient<null>(`/users/${userId}`, {
        method: 'DELETE',
    });
};
