// routes/productMedia.routes.js
import express from "express";
import ProductMediaController from "../controllers/productMedia.controller.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// =========================================================
// 🌐 PUBLIC ROUTES (KHÔNG CẦN ĐĂNG NHẬP)
// =========================================================

/**
 * @route   GET /api/product-media/product/:product_id
 * @desc    Lấy danh sách media theo product ID
 * @access  Public
 */
router.get("/product/:product_id", ProductMediaController.getMediaByProductId);

/**
 * @route   GET /api/product-media/variant/:variant_id
 * @desc    Lấy danh sách media theo variant ID
 * @access  Public
 */
router.get("/variant/:variant_id", ProductMediaController.getMediaByVariantId);

/**
 * @route   GET /api/product-media/primary/:product_id
 * @desc    Lấy primary media theo product ID
 * @access  Public
 */
router.get(
  "/primary/:product_id",
  ProductMediaController.getPrimaryMediaByProductId
);

/**
 * @route   GET /api/product-media/:id
 * @desc    Lấy chi tiết product media theo ID
 * @access  Public
 */
router.get("/:id", ProductMediaController.getProductMediaById);

// =========================================================
// 👑 ADMIN ROUTES (YÊU CẦU ĐĂNG NHẬP VÀ QUYỀN ADMIN)
// =========================================================

/**
 * @route   GET /api/product-media
 * @desc    Lấy danh sách product media (phân trang, filter) - ADMIN ONLY
 * @access  Private/Admin
 */
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  ProductMediaController.getProductMedia
);

/**
 * @route   POST /api/product-media
 * @desc    Tạo product media mới - ADMIN ONLY
 * @access  Private/Admin
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  ProductMediaController.createProductMedia
);

/**
 * @route   PUT /api/product-media/:id
 * @desc    Cập nhật product media - ADMIN ONLY
 * @access  Private/Admin
 */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  ProductMediaController.updateProductMedia
);

/**
 * @route   DELETE /api/product-media/:id
 * @desc    Xóa product media - ADMIN ONLY
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  ProductMediaController.deleteProductMedia
);

/**
 * @route   GET /api/product-media/stats/overview
 * @desc    Lấy thống kê product media - ADMIN ONLY
 * @access  Private/Admin
 */
router.get(
  "/stats/overview",
  authMiddleware,
  adminMiddleware,
  ProductMediaController.getProductMediaStats
);

export default router;
