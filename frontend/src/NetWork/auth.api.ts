import { apiClient } from './apiClient';
// ✅ Sử dụng import type cho type ApiResponse
import type { ApiResponse } from './apiClient';

// ⚠️ Giả định bạn đã tạo file session.ts và export các hàm sau
// Thay thế import authStore cũ bằng các hàm quản lý session mới
import { saveUserSession, clearUserSession } from "../utils/session"; 
import type { UserSession } from "../utils/session"; // Import type

// --- Khai báo Types (Models) ---

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterCredentials extends LoginCredentials {
    name: string;
}

interface AuthResponseData {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string;
        role: 'customer' | 'admin';
    };
}

interface ResetPasswordData {
    token: string;
    newPassword: string;
}


// --- API Services ---

/**
 * 1. API: Đăng ký người dùng mới (POST /api/auth/register)
 * @param credentials Tên, Email, Mật khẩu
 * @returns Promise<ApiResponse>
 */
export const register = async (credentials: RegisterCredentials): Promise<ApiResponse> => {
    // API endpoint: /api/auth/register
    const result = await apiClient('/auth/register', {
        method: 'POST',
        body: credentials,
    });

    if (result.success && !result.message) {
        result.message = "Đăng ký tài khoản thành công!";
    }

    return result;
};


/**
 * 2. API: Đăng nhập (POST /api/auth/login)
 * @param credentials Email và Mật khẩu
 * @returns Promise<ApiResponse<AuthResponseData>>
 */
export const login = async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponseData>> => {
    // API endpoint: /api/auth/login
    const result = await apiClient<AuthResponseData>('/auth/login', {
        method: 'POST',
        body: credentials,
    });

    if (result.success && !result.message) {
        result.message = "Đăng nhập thành công.";
    }

    // ✅ CHUẨN HÓA: LƯU PHIÊN DÙNG HÀM `saveUserSession`
    if (result.success && result.data) {
        const sessionData: UserSession = {
            token: result.data.token,
            name: result.data.user.name,
            email: result.data.user.email,
            phone: result.data.user.phone,
        };
        saveUserSession(sessionData); // Lưu token và thông tin user
    }

    return result;
};


/**
 * 3. API: Gửi yêu cầu Quên Mật khẩu (POST /api/auth/forgot-password)
 * @param email Email người dùng
 * @returns Promise<ApiResponse>
 */
export const forgotPassword = async (email: string): Promise<ApiResponse> => {
    // API endpoint: /api/auth/forgot-password
    const result = await apiClient('/auth/forgot-password', {
        method: 'POST',
        body: { email },
    });

    if (result.success && !result.message) {
        result.message = "Đường link đặt lại mật khẩu đã được gửi đến email của bạn.";
    }
    
    return result;
};


/**
 * 4. API: Đặt lại Mật khẩu (POST /api/auth/reset-password)
 * @param data Token và Mật khẩu mới
 * @returns Promise<ApiResponse>
 */
export const resetPassword = async (data: ResetPasswordData): Promise<ApiResponse> => {
    // API endpoint: /api/auth/reset-password
    const result = await apiClient('/auth/reset-password', {
        method: 'POST',
        body: data,
    });

    if (result.success && !result.message) {
        result.message = "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.";
    }

    return result;
};

// --- API đã chuyển từ profileApi.ts ---

/**
 * 5. API: Đổi Mật khẩu (POST /api/auth/change-password)
 * Lưu ý: API này cần token xác thực
 */
export const changePassword = async (oldPassword: string, newPassword: string): Promise<ApiResponse> => {
    // API endpoint: /api/auth/change-password
    const result = await apiClient('/auth/change-password', {
        method: 'POST',
        body: { oldPassword, newPassword },
        // apiClient đã tự động thêm Authorization header (Đã được xác nhận)
    });

    if (result.success && !result.message) {
        result.message = "Mật khẩu đã được đổi thành công!";
    }
    
    return result;
};

/**
 * 6. API: Đăng xuất (POST /api/auth/logout)
 * Lưu ý: Xóa token client sau khi gọi API thành công
 */
export const logout = async (): Promise<ApiResponse> => {
    // API endpoint: /api/auth/logout
    const result = await apiClient('/auth/logout', {
        method: 'POST',
    });
        
    if (result.success) {
        // ✅ CHUẨN HÓA: XÓA PHIÊN DÙNG HÀM `clearUserSession`
        clearUserSession(); 
        if (!result.message) {
             result.message = "Đã đăng xuất thành công.";
        }
    }

    return result;
};