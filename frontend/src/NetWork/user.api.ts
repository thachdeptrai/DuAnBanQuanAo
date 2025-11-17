// src/api/user.api.ts
import { apiClient } from "./apiClient";
import type { ApiResponse } from "./apiClient";

/**
 * Interface cho dữ liệu người dùng cơ bản (trừ mật khẩu)
 */
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    avatar: string | null;
    role: 'customer' | 'admin';
    status: 'active' | 'deleted' | 'pending';
    created_at: string;
    updated_at: string;
}

/**
 * Interface cho dữ liệu cần thiết khi cập nhật
 */
export interface UpdateUserData {
    name?: string;
    phone?: string | null;
    address?: string | null;
    avatar?: string | null;
    email?: string;
}

/**
 * Interface cho đổi mật khẩu
 */
export interface ChangePasswordData {
    oldPassword: string;
    newPassword: string;
}

/**
 * Interface cho body khi xóa tài khoản (yêu cầu mật khẩu)
 */
export interface DeleteSelfPayload {
    password: string;
}

/**
 * Interface cho thống kê user
 */
export interface UserStatistics {
    orders: number;
    cartItems: number;
    wishlistItems: number;
}

// ==========================================================
// A. THAO TÁC CÁ NHÂN (PROFILE) - SỬA ENDPOINT CHO ĐÚNG
// ==========================================================

/**
 * Lấy thông tin cá nhân của người dùng hiện tại
 */
export const getProfile = (): Promise<ApiResponse<UserProfile>> => {
    return apiClient<UserProfile>('/users/profile', { // SỬA: /users/me -> /users/profile
        method: 'GET',
    });
};

/**
 * Cập nhật thông tin cá nhân của người dùng hiện tại
 */
export const updateProfile = (data: UpdateUserData): Promise<ApiResponse<UserProfile>> => {
    return apiClient<UserProfile>('/users/profile', { // SỬA: /users/me -> /users/profile
        method: 'PUT',
        body: data,
    });
};

/**
 * Đổi mật khẩu người dùng hiện tại
 */
// src/api/user.api.ts
export const changePassword = (data: ChangePasswordData): Promise<ApiResponse<null>> => {
    return apiClient<null>('/users/change-password', {
        method: 'PUT',
        body: data,
    });
};

/**
 * Người dùng tự xóa tài khoản của mình
 * @param data Object chứa { password } để xác nhận
 */
export const deleteSelfAccount = (data: DeleteSelfPayload): Promise<ApiResponse<null>> => {
    return apiClient<null>('/users/account', { // SỬA: /users/me -> /users/account
        method: 'DELETE',
        body: data,
    });
};

/**
 * Lấy thống kê của người dùng hiện tại (số đơn hàng, giỏ hàng, wishlist)
 */
export const getUserStatistics = (): Promise<ApiResponse<UserStatistics>> => {
    return apiClient<UserStatistics>('/users/statistics', { // SỬA: /users/me/statistics -> /users/statistics
        method: 'GET',
    });
};

// ==========================================================
// B. THAO TÁC QUẢN TRỊ (ADMIN) - nếu sau này muốn mở rộng
// ==========================================================

/**
 * Lấy danh sách tất cả người dùng (Admin-only)
 */
export const getAllUsers = (): Promise<ApiResponse<UserProfile[]>> => {
    return apiClient<UserProfile[]>('/admin/users', {
        method: 'GET',
    });
};

/**
 * Lấy thông tin chi tiết một người dùng bằng ID (Admin-only)
 */
export const getUserDetails = (userId: number | string): Promise<ApiResponse<UserProfile>> => {
    return apiClient<UserProfile>(`/admin/users/${userId}`, {
        method: 'GET',
    });
};

/**
 * Admin cập nhật thông tin người dùng bằng ID
 */
export const updateUserById = (userId: number | string, data: UpdateUserData): Promise<ApiResponse<UserProfile>> => {
    return apiClient<UserProfile>(`/admin/users/${userId}`, {
        method: 'PUT',
        body: data,
    });
};

/**
 * Admin xóa một người dùng bằng ID
 */
export const deleteUserById = (userId: number | string): Promise<ApiResponse<null>> => {
    return apiClient<null>(`/admin/users/${userId}`, {
        method: 'DELETE',
    });
};