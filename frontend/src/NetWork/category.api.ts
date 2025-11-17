/**
 * ✅ category.api.ts — API cho Danh Mục (Category)
 * ----------------------------------------------------
 * - Gọi API public và admin từ backend
 * - Dùng chung apiClient chuẩn hóa
 * - Có hỗ trợ upload ảnh
 */

import { apiClient } from "./apiClient";

/* ----------------------------------------------------
 * 1️⃣ ĐỊNH NGHĨA KIỂU DỮ LIỆU
 * ---------------------------------------------------- */
export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  description?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
  meta_title?: string;
  meta_description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ----------------------------------------------------
 * 2️⃣ CLIENT (PUBLIC) API
 * ---------------------------------------------------- */

// Lấy tất cả danh mục đang hoạt động
export const getAllCategories = async () => {
  return apiClient<Category[]>("/categories");
};

// Lấy chi tiết danh mục theo slug
export const getCategoryBySlug = async (slug: string) => {
  return apiClient<Category>(`/categories/${slug}`);
};

/* ----------------------------------------------------
 * 3️⃣ ADMIN API (CẦN TOKEN)
 * ---------------------------------------------------- */

// Lấy tất cả danh mục (bao gồm ẩn)
export const adminGetAllCategories = async () => {
  return apiClient<Category[]>("/categories/admin");
};

// Tạo danh mục mới
export const createCategory = async (data: Partial<Category>) => {
  return apiClient<Category>("/categories/admin", {
    method: "POST",
    body: data,
  });
};

// Cập nhật danh mục
export const updateCategory = async (id: number, data: Partial<Category>) => {
  return apiClient<Category>(`/categories/admin/${id}`, {
    method: "PUT",
    body: data,
  });
};

// Xóa danh mục
export const deleteCategory = async (id: number) => {
  return apiClient(`/categories/admin/${id}`, {
    method: "DELETE",
  });
};

/* ----------------------------------------------------
 * 4️⃣ UPLOAD ẢNH DANH MỤC
 * ---------------------------------------------------- */
export const uploadCategoryImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/categories/upload`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Upload ảnh thất bại:", error);
    return { success: false, message: "Upload thất bại" };
  }
};
