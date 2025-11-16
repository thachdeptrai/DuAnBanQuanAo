// routes/productVariant.routes.js
import express from "express";
import ProductVariantController from "../controllers/productVariant.controller.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// =========================================================
// 🌐 PUBLIC ROUTES (KHÔNG CẦN ĐĂNG NHẬP)
// =========================================================

/**
 * @route   GET /api/product-variants/product/:product_id
 * @desc    Lấy danh sách variants theo product ID
 * @access  Public
 */
router.get(
  "/product/:product_id",
  ProductVariantController.getVariantsByProductId
);

/**
 * @route   GET /api/product-variants/:id
 * @desc    Lấy chi tiết product variant theo ID
 * @access  Public
 */
router.get("/:id", ProductVariantController.getProductVariantById);

// =========================================================
// 👑 ADMIN ROUTES (YÊU CẦU ĐĂNG NHẬP VÀ QUYỀN ADMIN)
// =========================================================

/**
 * @route   GET /api/product-variants
 * @desc    Lấy danh sách product variants (phân trang, filter) - ADMIN ONLY
 * @access  Private/Admin
 */
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  ProductVariantController.getProductVariants
);

/**
 * @route   POST /api/product-variants
 * @desc    Tạo product variant mới - ADMIN ONLY
 * @access  Private/Admin
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  ProductVariantController.createProductVariant
);

/**
 * @route   PUT /api/product-variants/:id
 * @desc    Cập nhật product variant - ADMIN ONLY
 * @access  Private/Admin
 */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  ProductVariantController.updateProductVariant
);

/**
 * @route   DELETE /api/product-variants/:id
 * @desc    Xóa product variant - ADMIN ONLY
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  ProductVariantController.deleteProductVariant
);

/**
 * @route   PATCH /api/product-variants/:id/toggle-status
 * @desc    Thay đổi trạng thái active/inactive của product variant - ADMIN ONLY
 * @access  Private/Admin
 */
router.patch(
  "/:id/toggle-status",
  authMiddleware,
  adminMiddleware,
  ProductVariantController.toggleProductVariantStatus
);

/**
 * @route   GET /api/product-variants/alerts/low-stock
 * @desc    Lấy danh sách variants tồn kho thấp - ADMIN ONLY
 * @access  Private/Admin
 */
router.get(
  "/alerts/low-stock",
  authMiddleware,
  adminMiddleware,
  ProductVariantController.getLowStockVariants
);

/**
 * @route   GET /api/product-variants/stats/overview
 * @desc    Lấy thống kê product variants - ADMIN ONLY
 * @access  Private/Admin
 */
router.get(
  "/stats/overview",
  authMiddleware,
  adminMiddleware,
  ProductVariantController.getProductVariantStats
);

export default router;
