// routes/attribute.routes.js
import express from "express";
import AttributeController from "../controllers/attribute.controller.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// =========================================================
// 🌐 PUBLIC ROUTES (KHÔNG CẦN ĐĂNG NHẬP)
// =========================================================

/**
 * @route   GET /api/attributes/active
 * @desc    Lấy danh sách attributes đang active (cho website)
 * @access  Public
 */
router.get("/active", AttributeController.getActiveAttributes);

/**
 * @route   GET /api/attributes/:id
 * @desc    Lấy chi tiết attribute theo ID
 * @access  Public
 */
router.get("/:id", AttributeController.getAttributeById);

// =========================================================
// 👑 ADMIN ROUTES (YÊU CẦU ĐĂNG NHẬP VÀ QUYỀN ADMIN)
// =========================================================

/**
 * @route   GET /api/attributes
 * @desc    Lấy danh sách attributes (phân trang, filter) - ADMIN ONLY
 * @access  Private/Admin
 */
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  AttributeController.getAttributes
);

/**
 * @route   POST /api/attributes
 * @desc    Tạo attribute mới - ADMIN ONLY
 * @access  Private/Admin
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  AttributeController.createAttribute
);

/**
 * @route   PUT /api/attributes/:id
 * @desc    Cập nhật attribute - ADMIN ONLY
 * @access  Private/Admin
 */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  AttributeController.updateAttribute
);

/**
 * @route   DELETE /api/attributes/:id
 * @desc    Xóa attribute - ADMIN ONLY
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  AttributeController.deleteAttribute
);

/**
 * @route   PATCH /api/attributes/:id/toggle-status
 * @desc    Thay đổi trạng thái active/inactive của attribute - ADMIN ONLY
 * @access  Private/Admin
 */
router.patch(
  "/:id/toggle-status",
  authMiddleware,
  adminMiddleware,
  AttributeController.toggleAttributeStatus
);

/**
 * @route   GET /api/attributes/stats/overview
 * @desc    Lấy thống kê attributes - ADMIN ONLY
 * @access  Private/Admin
 */
router.get(
  "/stats/overview",
  authMiddleware,
  adminMiddleware,
  AttributeController.getAttributeStats
);

/**
 * @route   GET /api/attributes/search/suggestions
 * @desc    Tìm kiếm attributes theo tên - ADMIN ONLY
 * @access  Private/Admin
 */
router.get(
  "/search/suggestions",
  authMiddleware,
  adminMiddleware,
  AttributeController.searchAttributes
);

export default router;
