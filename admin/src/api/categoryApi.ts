// categoryApi.ts
import axiosClient from "./axiosClient";


// =========================================================
// 🔹 CATEGORY INTERFACES
// =========================================================

export interface Category {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
    description: string | null;
    image: string | null;
    sort_order: number;
    is_active: boolean;
    meta_title: string | null;
    meta_description: string | null;
    created_at: string;
    updated_at: string;
    parent?: Category;
    children?: Category[];
}

export interface CategoriesResponse {
    success: boolean;
    message: string;
    data: {
        categories: Category[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    };
}

export interface CategoryResponse {
    success: boolean;
    message: string;
    data: Category;
}

export interface CategoryStats {
    total_categories: number;
    active_categories: number;
    inactive_categories: number;
    parent_categories: number;
    child_categories: number;
    categories_with_products: Array<{
        id: string;
        name: string;
        product_count: number;
    }>;
}

export interface CreateCategoryData {
    name: string;
    slug: string;
    parent_id?: string | null;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
    meta_title?: string;
    meta_description?: string;
    image_url?: string;
}

export interface UpdateCategoryData {
    name?: string;
    slug?: string;
    parent_id?: string | null;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
    meta_title?: string;
    meta_description?: string;
    image_url?: string;
    remove_image?: boolean;
}

export interface ToggleStatusResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        name: string;
        is_active: boolean;
    };
}

// =========================================================
// 🔹 CATEGORY APIs (ADMIN ONLY)
// =========================================================

/**
 * 📋 Lấy danh sách categories với phân trang và filter (Admin only)
 */
export const getCategoriesApi = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    parent_id?: string | null;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}): Promise<CategoriesResponse> => {
    const res = await axiosClient.get<CategoriesResponse>("/admin/categories", { params });
    return res.data;
};

/**
 * 🔍 Lấy chi tiết category theo ID (Admin only)
 */
export const getCategoryByIdApi = async (categoryId: string): Promise<CategoryResponse> => {
    const res = await axiosClient.get<CategoryResponse>(`/admin/categories/${categoryId}`);
    return res.data;
};

/**
 * ➕ Tạo category mới (Admin only)
 */
export const createCategoryApi = async (
    data: CreateCategoryData,
    imageFile?: File
): Promise<CategoryResponse> => {
    const formData = new FormData();

    // Thêm dữ liệu category
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
        }
    });

    // Thêm file ảnh nếu có
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const res = await axiosClient.post<CategoryResponse>("/admin/categories", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

/**
 * ✏️ Cập nhật category (Admin only)
 */
export const updateCategoryApi = async (
    categoryId: string,
    data: UpdateCategoryData,
    imageFile?: File
): Promise<CategoryResponse> => {
    const formData = new FormData();

    // Thêm dữ liệu cập nhật
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
        }
    });

    // Thêm file ảnh nếu có
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const res = await axiosClient.put<CategoryResponse>(`/admin/categories/${categoryId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

/**
 * 🗑️ Xóa category (Admin only)
 */
export const deleteCategoryApi = async (categoryId: string): Promise<{
    success: boolean;
    message: string;
}> => {
    const res = await axiosClient.delete(`/admin/categories/${categoryId}`);
    return res.data;
};

/**
 * 🔄 Thay đổi trạng thái category (Admin only)
 */
export const toggleCategoryStatusApi = async (categoryId: string): Promise<ToggleStatusResponse> => {
    const res = await axiosClient.patch<ToggleStatusResponse>(`/admin/categories/${categoryId}/toggle-status`);
    return res.data;
};

/**
 * 📊 Lấy thống kê categories (Admin only)
 */
export const getCategoryStatsApi = async (): Promise<{
    success: boolean;
    message: string;
    data: CategoryStats;
}> => {
    const res = await axiosClient.get<{ success: boolean; message: string; data: CategoryStats }>("/admin/categories/stats");
    return res.data;
};

/**
 * 🌐 Lấy danh sách categories active (cho dropdown, form selection)
 */
export const getActiveCategoriesApi = async (): Promise<{
    success: boolean;
    message: string;
    data: Category[];
}> => {
    const res = await axiosClient.get<{ success: boolean; message: string; data: Category[] }>("/admin/categories/active");
    return res.data;
};

export default {
    getCategoriesApi,
    getCategoryByIdApi,
    createCategoryApi,
    updateCategoryApi,
    deleteCategoryApi,
    toggleCategoryStatusApi,
    getCategoryStatsApi,
    getActiveCategoriesApi,
};