// routes/brand.routes.js
import express from "express";
import BrandController from "../controllers/brand.controller.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";
import {
  uploadBrand,
  handleUploadError,
} from "../middlewares/upload.middleware.js";

const router = express.Router();

// =========================================================
// 🌐 PUBLIC ROUTES (KHÔNG CẦN ĐĂNG NHẬP)
// =========================================================

/**
 * @route   GET /api/brands/active
 * @desc    Lấy danh sách brands đang active (cho website)
 * @access  Public
 */
router.get("/active", BrandController.getActiveBrands);

/**
 * @route   GET /api/brands/:id
 * @desc    Lấy chi tiết brand theo ID hoặc slug
 * @access  Public
 */
router.get("/:id", BrandController.getBrandById);

// =========================================================
// 👑 ADMIN ROUTES (YÊU CẦU ĐĂNG NHẬP VÀ QUYỀN ADMIN)
// =========================================================

/**
 * @route   GET /api/brands
 * @desc    Lấy danh sách brands (phân trang, filter) - ADMIN ONLY
 * @access  Private/Admin
 */
router.get("/", authMiddleware, adminMiddleware, BrandController.getBrands);

/**
 * @route   POST /api/brands
 * @desc    Tạo brand mới - ADMIN ONLY
 * @access  Private/Admin
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  uploadBrand.single("logo"),
  handleUploadError,
  BrandController.createBrand
);

/**
 * @route   PUT /api/brands/:id
 * @desc    Cập nhật brand - ADMIN ONLY
 * @access  Private/Admin
 */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  uploadBrand.single("logo"),
  handleUploadError,
  BrandController.updateBrand
);

/**
 * @route   DELETE /api/brands/:id
 * @desc    Xóa brand - ADMIN ONLY
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  BrandController.deleteBrand
);

/**
 * @route   PATCH /api/brands/:id/toggle-status
 * @desc    Thay đổi trạng thái active/inactive của brand - ADMIN ONLY
 * @access  Private/Admin
 */
router.patch(
  "/:id/toggle-status",
  authMiddleware,
  adminMiddleware,
  BrandController.toggleBrandStatus
);

/**
 * @route   GET /api/brands/stats/overview
 * @desc    Lấy thống kê brands - ADMIN ONLY
 * @access  Private/Admin
 */
router.get(
  "/stats/overview",
  authMiddleware,
  adminMiddleware,
  BrandController.getBrandStats
);

export default router;
