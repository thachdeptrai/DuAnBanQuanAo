// routes/product.routes.js
import express from "express";
import ProductController from "../controllers/product.controller.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";
import {
  uploadProduct,
  handleUploadError,
} from "../middlewares/upload.middleware.js";

const router = express.Router();

// =========================================================
// 🌐 PUBLIC ROUTES (KHÔNG CẦN ĐĂNG NHẬP)
// =========================================================

/**
 * @route   GET /api/products/active
 * @desc    Lấy danh sách products đang active (cho website)
 * @access  Public
 */
router.get("/active", ProductController.getActiveProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Lấy chi tiết product theo ID hoặc slug
 * @access  Public
 */
router.get("/:id", ProductController.getProductById);

// =========================================================
// 👑 ADMIN ROUTES (YÊU CẦU ĐĂNG NHẬP VÀ QUYỀN ADMIN)
// =========================================================

/**
 * @route   GET /api/products
 * @desc    Lấy danh sách products (phân trang, filter) - ADMIN ONLY
 * @access  Private/Admin
 */
router.get("/", authMiddleware, adminMiddleware, ProductController.getProducts);

/**
 * @route   POST /api/products
 * @desc    Tạo product mới - ADMIN ONLY
 * @access  Private/Admin
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  ProductController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Cập nhật product - ADMIN ONLY
 * @access  Private/Admin
 */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  ProductController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Xóa product - ADMIN ONLY
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  ProductController.deleteProduct
);

/**
 * @route   PATCH /api/products/:id/toggle-status
 * @desc    Thay đổi trạng thái active/inactive của product - ADMIN ONLY
 * @access  Private/Admin
 */
router.patch(
  "/:id/toggle-status",
  authMiddleware,
  adminMiddleware,
  ProductController.toggleProductStatus
);

/**
 * @route   PATCH /api/products/:id/toggle-featured
 * @desc    Thay đổi trạng thái featured của product - ADMIN ONLY
 * @access  Private/Admin
 */
router.patch(
  "/:id/toggle-featured",
  authMiddleware,
  adminMiddleware,
  ProductController.toggleProductFeatured
);

/**
 * @route   PATCH /api/products/:id/toggle-new
 * @desc    Thay đổi trạng thái new của product - ADMIN ONLY
 * @access  Private/Admin
 */
router.patch(
  "/:id/toggle-new",
  authMiddleware,
  adminMiddleware,
  ProductController.toggleProductNew
);

/**
 * @route   GET /api/products/stats/overview
 * @desc    Lấy thống kê products - ADMIN ONLY
 * @access  Private/Admin
 */
router.get(
  "/stats/overview",
  authMiddleware,
  adminMiddleware,
  ProductController.getProductStats
);

export default router;
