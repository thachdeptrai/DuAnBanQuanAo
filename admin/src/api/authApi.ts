import axiosClient from "./axiosClient";

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar?: string;
      phone?: string;
      address?: string;
      status: string;
    };
    accessToken: string;
    expiresIn: string;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: string;
  status: string;
  email_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UsersResponse {
  users: any;
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      usersPerPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalNormalUsers: number;
}

export interface BanUserData {
  status: "active" | "inactive";
}

export interface CreateUserData {
  email: string;
  password: string;
  role: string;
  name?: string;
  phone?: string;
}

// =========================================================
// 🔹 AUTH APIs
// =========================================================
export const loginApi = async (data: LoginData): Promise<LoginResponse> => {
  const res = await axiosClient.post<LoginResponse>("/auth/login", data);
  return res.data;
};

export const logoutApi = async (): Promise<{ success: boolean; message: string }> => {
  const res = await axiosClient.post("/auth/logout");
  return res.data;
};

export const refreshTokenApi = async (refreshToken?: string): Promise<{
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    user: User;
  };
}> => {
  const res = await axiosClient.post("/auth/refresh-token", { refreshToken });
  return res.data;
};

// =========================================================
// 🔹 ADMIN APIs - CHỈ LẤY CÁC HÀM ADMIN
// =========================================================

/**
 * Lấy danh sách tất cả users (Admin only)
 */
export const getAllUsersApi = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<UsersResponse> => {
  const res = await axiosClient.get<UsersResponse>("/auth/users", { params });
  return res.data;
};

/**
 * Lấy thông tin chi tiết user bằng ID (Admin only)
 */
export const getUserByIdApi = async (userId: string): Promise<{
  message: string; success: boolean; data: User
}> => {
  const res = await axiosClient.get<{ success: boolean; message: string; data: User }>(`/auth/users/${userId}`);
  return res.data;
};

/**
 * Tạo user mới (Admin only)
 */
export const createUserApi = async (data: CreateUserData): Promise<{ success: boolean; data: User }> => {
  const res = await axiosClient.post<{ success: boolean; data: User }>("/auth/users", data);
  return res.data;
};

/**
 * Cấm/Bỏ cấm user (Admin only)
 */
export const banUserApi = async (userId: string, data: BanUserData): Promise<{
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    oldStatus: string;
    newStatus: string;
    action: string;
    updatedBy: string;
    updatedAt: string;
  };
}> => {
  // SỬA: /ban → /status để khớp với backend route
  const res = await axiosClient.patch(`/auth/users/${userId}/status`, data);
  return res.data;
};

/**
 * Lấy thống kê admin (Admin only)
 */
export const getAdminStatsApi = async (): Promise<{
  totalNormalUsers(totalNormalUsers: any): number;
  totalAdmins(totalAdmins: any): number;
  totalUsers(totalUsers: any): number;
  success: boolean; data: AdminStats
}> => {
  const res = await axiosClient.get<{ success: boolean; data: AdminStats }>("/auth/stats");
  return res.data;
};

/**
 * Đổi mật khẩu (cho admin thay đổi mật khẩu của chính mình)
 */
export const changePasswordApi = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> => {
  const res = await axiosClient.put("/auth/change-password", data);
  return res.data;
};