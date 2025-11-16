// routes/variantAttribute.routes.js
import express from "express";
import VariantAttributeController from "../controllers/variantAttribute.controller.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// =========================================================
// 🌐 PUBLIC ROUTES (KHÔNG CẦN ĐĂNG NHẬP)
// =========================================================

/**
 * @route   GET /api/variant-attributes/variant/:variant_id
 * @desc    Lấy danh sách variant attributes theo variant ID
 * @access  Public
 */
router.get(
  "/variant/:variant_id",
  VariantAttributeController.getAttributesByVariantId
);

/**
 * @route   GET /api/variant-attributes/:id
 * @desc    Lấy chi tiết variant attribute theo ID
 * @access  Public
 */
router.get("/:id", VariantAttributeController.getVariantAttributeById);

// =========================================================
// 👑 ADMIN ROUTES (YÊU CẦU ĐĂNG NHẬP VÀ QUYỀN ADMIN)
// =========================================================

/**
 * @route   GET /api/variant-attributes
 * @desc    Lấy danh sách variant attributes (phân trang, filter) - ADMIN ONLY
 * @access  Private/Admin
 */
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  VariantAttributeController.getVariantAttributes
);

/**
 * @route   POST /api/variant-attributes
 * @desc    Tạo variant attribute mới - ADMIN ONLY
 * @access  Private/Admin
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  VariantAttributeController.createVariantAttribute
);

/**
 * @route   PUT /api/variant-attributes/:id
 * @desc    Cập nhật variant attribute - ADMIN ONLY
 * @access  Private/Admin
 */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  VariantAttributeController.updateVariantAttribute
);

/**
 * @route   DELETE /api/variant-attributes/:id
 * @desc    Xóa variant attribute - ADMIN ONLY
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  VariantAttributeController.deleteVariantAttribute
);

/**
 * @route   POST /api/variant-attributes/search/variants
 * @desc    Tìm kiếm variants theo attribute combination - ADMIN ONLY
 * @access  Private/Admin
 */
router.post(
  "/search/variants",
  authMiddleware,
  adminMiddleware,
  VariantAttributeController.findVariantsByAttributes
);

/**
 * @route   GET /api/variant-attributes/stats/overview
 * @desc    Lấy thống kê variant attributes - ADMIN ONLY
 * @access  Private/Admin
 */
router.get(
  "/stats/overview",
  authMiddleware,
  adminMiddleware,
  VariantAttributeController.getVariantAttributeStats
);

export default router;
