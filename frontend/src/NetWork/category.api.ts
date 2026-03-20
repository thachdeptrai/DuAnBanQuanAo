// category.api.ts
// ✅ CHỈ LẤY CÁC CHỨC NĂNG PUBLIC CHO USER

import { apiClient } from "./apiClient";

/* ----------------------------------------------------
 * 1️⃣ ĐỊNH NGHĨA KIỂU DỮ LIỆU
 * ---------------------------------------------------- */
export interface Category {
  image_url: any;
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  description?: string;
  image?: string; // Đổi từ image_url sang image để khớp với backend
  sort_order?: number;
  is_active?: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;

  // Các trường quan hệ (nếu có)
  parent?: Category;
  children?: Category[];
}

export interface CategoryWithChildren extends Category {
  children?: Category[];
}

/* ----------------------------------------------------
 * 2️⃣ PUBLIC API - CHO USER/WEBSITE
 * ---------------------------------------------------- */

/**
 * 🌐 Lấy danh sách danh mục đang hoạt động (cho website)
 * - Chỉ lấy danh mục có is_active = true
 * - Có phân cấp parent-children
 */
export const getActiveCategories = async (): Promise<{
  success: boolean;
  message: string;
  data: CategoryWithChildren[];
}> => {
  const res = await apiClient("/categories/active") as {
    success: boolean;
    message: string;
    data?: CategoryWithChildren[] | null;
  };

  return {
    ...res,
    data: res.data ?? []
  };
};

/**
 * 🔍 Lấy chi tiết danh mục theo ID hoặc Slug
 * - Có thể dùng cả ID (number) hoặc Slug (string)
 * - Tự động detect để tìm đúng
 */
export const getCategoryDetail = async (identifier: string | number): Promise<{
  success: boolean;
  message: string;
  data: Category;
}> => {
  const res = await apiClient(`/categories/${identifier}`) as {
    success: boolean;
    message: string;
    data?: Category | null;
  };

  if (!res.data) {
    throw new Error("Category not found");
  }

  return {
    ...res,
    data: res.data
  };
};

/**
 * 📊 Lấy danh sách danh mục gốc (parent categories)
 * - Chỉ lấy danh mục cấp cha (parent_id = null)
 * - Đang hoạt động
 */
export const getParentCategories = async (): Promise<{
  success: boolean;
  message: string;
  data: Category[];
}> => {
  const result = await getActiveCategories();

  if (result.success) {
    // Lọc chỉ danh mục gốc (không có parent)
    const parentCategories = result.data.filter(category =>
      category.parent_id === null || category.parent_id === undefined
    );

    return {
      success: true,
      message: "Lấy danh sách danh mục gốc thành công",
      data: parentCategories
    };
  }

  return result;
};

/**
 * 🔍 Lấy danh mục con theo parent_id
 * - Lấy tất cả danh mục con của một danh mục cha
 */
export const getChildCategories = async (parentId: number): Promise<{
  success: boolean;
  message: string;
  data: Category[];
}> => {
  const result = await getActiveCategories();

  if (result.success) {
    // Tìm tất cả danh mục con của parentId
    const childCategories = result.data.flatMap(parent =>
      parent.children?.filter(child => child.parent_id === parentId) || []
    );

    return {
      success: true,
      message: `Lấy danh sách danh mục con thành công (${childCategories.length} danh mục)`,
      data: childCategories
    };
  }

  return result;
};

/**
 * 🎯 Tìm kiếm danh mục theo tên
 * - Tìm trong danh mục đang hoạt động
 */
export const searchCategories = async (searchTerm: string): Promise<{
  success: boolean;
  message: string;
  data: Category[];
}> => {
  const result = await getActiveCategories();

  if (result.success && searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase().trim();
    const filteredCategories = result.data.flatMap(parent => [
      parent,
      ...(parent.children || [])
    ]).filter(category =>
      category.name.toLowerCase().includes(searchLower) ||
      category.slug.toLowerCase().includes(searchLower) ||
      (category.description && category.description.toLowerCase().includes(searchLower))
    );

    return {
      success: true,
      message: `Tìm thấy ${filteredCategories.length} danh mục phù hợp`,
      data: filteredCategories
    };
  }

  return result;
};

/**
 * 📁 Lấy danh sách danh mục dạng phẳng (không phân cấp)
 * - Useful cho dropdown/select options
 */
export const getFlatCategories = async (): Promise<{
  success: boolean;
  message: string;
  data: Category[];
}> => {
  const result = await getActiveCategories();

  if (result.success) {
    const flatCategories = result.data.flatMap(parent => [
      parent,
      ...(parent.children || [])
    ]);

    return {
      success: true,
      message: `Lấy danh sách danh mục phẳng thành công (${flatCategories.length} danh mục)`,
      data: flatCategories
    };
  }

  return result;
};

/* ----------------------------------------------------
 * 3️⃣ EXPORT TẤT CẢ PUBLIC APIs
 * ---------------------------------------------------- */
export const categoryApi = {
  getActiveCategories,
  getCategoryDetail,
  getParentCategories,
  getChildCategories,
  searchCategories,
  getFlatCategories,
};

export default categoryApi;