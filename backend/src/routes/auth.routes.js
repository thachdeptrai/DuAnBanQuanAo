// src/routes/auth.routes.js
import express from "express";
import {
  authMiddleware,
  adminMiddleware,
  ownerOrAdminMiddleware,
} from "../middlewares/authMiddleware.js";
import AuthController from "../controllers/auth.controller.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// 🔹 OTP – Đăng ký
router.post("/register/request-otp", AuthController.requestOtpForRegistration);
router.post("/register/finalize", AuthController.registerWithOtp);

// 🔹 Login & Refresh token
router.post("/login", AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);

// 🔹 Forgot password & Reset
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

// 🔹 Đổi mật khẩu (MỚI)
router.put("/change-password", authMiddleware, AuthController.changePassword);

// // 🔹 Verify token (public check)
// router.get("/verify-token", AuthController.verifyToken);

// ==================== PROTECTED ROUTES ====================
router.post("/logout", authMiddleware, AuthController.logout);

// ==================== ADMIN ROUTES ====================
router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  AuthController.getAllUsers
);
router.post(
  "/users",
  authMiddleware,
  adminMiddleware,
  AuthController.createUser
);
router.get(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  AuthController.getUserById
);
router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  AuthController.getAdminStats
);
// 🔹 ADMIN: Cấm/Bỏ cấm người dùng (BAN/UNBAN)
// PATCH /api/auth/users/:userId/status
router.patch(
  "/users/:userId/status",
  authMiddleware,
  adminMiddleware,
  AuthController.banUser // Tên hàm đã đổi
);

// ==================== USER PROFILE ROUTES ====================
router.get("/profile", authMiddleware, (req, res) => {
  // Trả về thông tin user từ token (đã có trong req.user)
  res.json({
    success: true,
    data: req.user,
  });
});
router.put("/profile", authMiddleware, ownerOrAdminMiddleware, (req, res) => {
  // Cập nhật profile user
  // TODO: Thêm controller update profile
});

export default router;
