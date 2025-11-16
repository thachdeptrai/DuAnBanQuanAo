// routes/attributeValue.routes.js
import express from "express";
import AttributeValueController from "../controllers/attribute_values.controller.js"; // ✅ SỬA TÊN FILE
import {
  authMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// =========================================================
// 🌐 PUBLIC ROUTES (KHÔNG CẦN ĐĂNG NHẬP)
// =========================================================

/**
 * @route   GET /api/attribute-values/active
 * @desc    Lấy danh sách attribute values đang active (cho website)
 * @access  Public
 */
router.get("/active", AttributeValueController.getActiveAttributeValues);

/**
 * @route   GET /api/attribute-values/attribute/:attribute_id
 * @desc    Lấy danh sách attribute values theo attribute ID
 * @access  Public
 */
router.get(
  "/attribute/:attribute_id",
  AttributeValueController.getValuesByAttributeId
);

/**
 * @route   GET /api/attribute-values/:id
 * @desc    Lấy chi tiết attribute value theo ID
 * @access  Public
 */
router.get("/:id", AttributeValueController.getAttributeValueById);

// =========================================================
// 👑 ADMIN ROUTES (YÊU CẦU ĐĂNG NHẬP VÀ QUYỀN ADMIN)
// =========================================================

/**
 * @route   GET /api/attribute-values
 * @desc    Lấy danh sách attribute values (phân trang, filter) - ADMIN ONLY
 * @access  Private/Admin
 */
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  AttributeValueController.getAttributeValues
);

/**
 * @route   POST /api/attribute-values
 * @desc    Tạo attribute value mới - ADMIN ONLY
 * @access  Private/Admin
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  AttributeValueController.createAttributeValue
);

/**
 * @route   PUT /api/attribute-values/:id
 * @desc    Cập nhật attribute value - ADMIN ONLY
 * @access  Private/Admin
 */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  AttributeValueController.updateAttributeValue
);

/**
 * @route   DELETE /api/attribute-values/:id
 * @desc    Xóa attribute value - ADMIN ONLY
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  AttributeValueController.deleteAttributeValue
);

/**
 * @route   PATCH /api/attribute-values/:id/toggle-status
 * @desc    Thay đổi trạng thái active/inactive của attribute value - ADMIN ONLY
 * @access  Private/Admin
 */
router.patch(
  "/:id/toggle-status",
  authMiddleware,
  adminMiddleware,
  AttributeValueController.toggleAttributeValueStatus
);

/**
 * @route   GET /api/attribute-values/stats/overview
 * @desc    Lấy thống kê attribute values - ADMIN ONLY
 * @access  Private/Admin
 */
router.get(
  "/stats/overview",
  authMiddleware,
  adminMiddleware,
  AttributeValueController.getAttributeValueStats
);

export default router;
