// routes/category.routes.js
import express from "express";
import CategoryController from "../controllers/category.controller.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";
import {
  uploadCategory,
  handleUploadError,
} from "../middlewares/upload.middleware.js";

const router = express.Router();

// =========================================================
// 🌐 PUBLIC ROUTES (KHÔNG CẦN ĐĂNG NHẬP)
// =========================================================

/**
 * @route   GET /api/categories/active
 * @desc    Lấy danh sách categories đang active (cho website)
 * @access  Public
 */
router.get("/active", CategoryController.getActiveCategories);
/**
 * @route   GET /api/categories/:id
 * @desc    Lấy chi tiết category theo ID hoặc slug
 * @access  Public
 */
router.get("/:id", CategoryController.getCategoryById);

// =========================================================
// 👑 ADMIN ROUTES (YÊU CẦU ĐĂNG NHẬP VÀ QUYỀN ADMIN)
// =========================================================

/**
 * @route   GET /api/categories
 * @desc    Lấy danh sách categories (phân trang, filter) - ADMIN ONLY
 * @access  Private/Admin
 */
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  CategoryController.getCategories
);

/**
 * @route   POST /api/categories
 * @desc    Tạo category mới - ADMIN ONLY
 * @access  Private/Admin
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  uploadCategory.single("image"),
  handleUploadError, // Middleware xử lý lỗi upload
  CategoryController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Cập nhật category - ADMIN ONLY
 * @access  Private/Admin
 */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  uploadCategory.single("image"),
  handleUploadError, // Middleware xử lý lỗi upload
  CategoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Xóa category - ADMIN ONLY
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  CategoryController.deleteCategory
);

/**
 * @route   PATCH /api/categories/:id/toggle-status
 * @desc    Thay đổi trạng thái active/inactive của category - ADMIN ONLY
 * @access  Private/Admin
 */
router.patch(
  "/:id/toggle-status",
  authMiddleware,
  adminMiddleware,
  CategoryController.toggleCategoryStatus
);

/**
 * @route   GET /api/categories/stats/overview
 * @desc    Lấy thống kê categories - ADMIN ONLY
 * @access  Private/Admin
 */
router.get(
  "/stats/overview",
  authMiddleware,
  adminMiddleware,
  CategoryController.getCategoryStats
);

export default router;
