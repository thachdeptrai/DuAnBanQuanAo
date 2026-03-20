// api/brandApi.ts
import axiosClient from "./axiosClient";

// =========================================================
// 🏷️ BRAND INTERFACES
// =========================================================

export interface Brand {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo_url?: string;
    website_url?: string;
    is_active: boolean;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface BrandCreateData {
    name: string;
    slug: string;
    description?: string;
    website_url?: string;
    sort_order?: number;
    is_active?: boolean;
    logo_url?: string;
}

export interface BrandUpdateData {
    name?: string;
    slug?: string;
    description?: string;
    website_url?: string;
    sort_order?: number;
    is_active?: boolean;
    logo_url?: string;
    remove_logo?: boolean;
}

export interface BrandsResponse {
    success: boolean;
    message: string;
    data: {
        brands: Brand[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    };
}

export interface BrandResponse {
    success: boolean;
    message: string;
    data: Brand;
}

export interface BrandStatsResponse {
    success: boolean;
    message: string;
    data: {
        total_brands: number;
        active_brands: number;
        inactive_brands: number;
        brands_with_products: Array<{
            id: string;
            name: string;
            product_count: number;
        }>;
    };
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
// 🔹 ADMIN BRAND APIs
// =========================================================

/**
 * 📋 Lấy danh sách brands (phân trang & filter) - Admin only
 */
export const getBrandsApi = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean | string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
}): Promise<BrandsResponse> => {
    const res = await axiosClient.get<BrandsResponse>("/admin/brands", { params });
    return res.data;
};

/**
 * ➕ Tạo brand mới - Admin only
 * Hỗ trợ cả JSON và FormData (file upload)
 */
export const createBrandApi = async (
    data: BrandCreateData | FormData
): Promise<BrandResponse> => {
    const config = data instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};

    const res = await axiosClient.post<BrandResponse>("/admin/brands", data, config);
    return res.data;
};

/**
 * ✏️ Cập nhật brand - Admin only
 * Hỗ trợ cả JSON và FormData (file upload)
 */
export const updateBrandApi = async (
    id: string,
    data: BrandUpdateData | FormData
): Promise<BrandResponse> => {
    const config = data instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};

    const res = await axiosClient.put<BrandResponse>(`/admin/brands/${id}`, data, config);
    return res.data;
};

/**
 * 🗑️ Xóa brand - Admin only
 */
export const deleteBrandApi = async (id: string): Promise<{
    success: boolean;
    message: string;
}> => {
    const res = await axiosClient.delete(`/admin/brands/${id}`);
    return res.data;
};

/**
 * 🔄 Thay đổi trạng thái brand (toggle active/inactive) - Admin only
 */
export const toggleBrandStatusApi = async (id: string): Promise<ToggleStatusResponse> => {
    const res = await axiosClient.patch<ToggleStatusResponse>(`/admin/brands/${id}/toggle-status`);
    return res.data;
};

/**
 * 📊 Lấy thống kê brands - Admin only
 */
export const getBrandStatsApi = async (): Promise<BrandStatsResponse> => {
    const res = await axiosClient.get<BrandStatsResponse>("/admin/brands/stats");
    return res.data;
};

/**
 * 🔍 Lấy chi tiết brand theo ID - Admin only
 */
export const getBrandByIdApi = async (id: string): Promise<BrandResponse> => {
    const res = await axiosClient.get<BrandResponse>(`/admin/brands/${id}`);
    return res.data;
};

// =========================================================
// 🔹 PUBLIC BRAND APIs
// =========================================================

/**
 * 🌐 Lấy danh sách brands active (public) - Cho website
 */
export const getActiveBrandsApi = async (): Promise<{
    success: boolean;
    message: string;
    data: Brand[];
}> => {
    const res = await axiosClient.get<{ success: boolean; message: string; data: Brand[] }>(
        "/brands/active"
    );
    return res.data;
};

/**
 * 🔍 Lấy chi tiết brand theo ID hoặc slug (public)
 */
export const getBrandDetailApi = async (idOrSlug: string): Promise<BrandResponse> => {
    const res = await axiosClient.get<BrandResponse>(`/brands/${idOrSlug}`);
    return res.data;
};

// =========================================================
// 🛠️ UTILITY FUNCTIONS
// =========================================================

/**
 * Tạo FormData từ brand data để upload file
 */
export const createBrandFormData = (data: BrandCreateData & { logo?: File }): FormData => {
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('slug', data.slug);

    if (data.description) formData.append('description', data.description);
    if (data.website_url) formData.append('website_url', data.website_url);
    if (data.sort_order) formData.append('sort_order', data.sort_order.toString());
    if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString());
    if (data.logo_url) formData.append('logo_url', data.logo_url);
    if (data.logo) formData.append('logo', data.logo); // File upload

    return formData;
};

/**
 * Tạo FormData từ brand update data để upload file
 */
export const updateBrandFormData = (data: BrandUpdateData & { logo?: File }): FormData => {
    const formData = new FormData();

    if (data.name) formData.append('name', data.name);
    if (data.slug) formData.append('slug', data.slug);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.website_url !== undefined) formData.append('website_url', data.website_url);
    if (data.sort_order !== undefined) formData.append('sort_order', data.sort_order.toString());
    if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString());
    if (data.logo_url !== undefined) formData.append('logo_url', data.logo_url);
    if (data.remove_logo !== undefined) formData.append('remove_logo', data.remove_logo.toString());
    if (data.logo) formData.append('logo', data.logo); // File upload

    return formData;
};

export default {
    // Admin APIs
    getBrands: getBrandsApi,
    createBrand: createBrandApi,
    updateBrand: updateBrandApi,
    deleteBrand: deleteBrandApi,
    toggleBrandStatus: toggleBrandStatusApi,
    getBrandStats: getBrandStatsApi,
    getBrandById: getBrandByIdApi,

    // Public APIs
    getActiveBrands: getActiveBrandsApi,
    getBrandDetail: getBrandDetailApi,

    // Utility functions
    createBrandFormData,
    updateBrandFormData,
};