const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");

// ✨ SỬA LỖI: Trích xuất hàm authMiddleware từ đối tượng export
// Thay vì: const authMiddleware = require("../middlewares/authMiddleware");
// Bạn phải trích xuất key: authMiddleware từ đối tượng được export.
const { authMiddleware } = require("../middlewares/authMiddleware");

// --- CÁC ROUTE CƠ BẢN ---
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// --- CÁC ROUTE QUẢN LÝ TÀI KHOẢN ---

// 1. Đăng xuất
router.post("/logout", AuthController.logout);

// 2. Đổi mật khẩu (Bây giờ authMiddleware là một hàm)
router.post("/change-password", authMiddleware, AuthController.changePassword);

// 3. Quên mật khẩu
router.post("/forgot-password", AuthController.forgotPassword);

// 4. Đặt lại mật khẩu
router.post("/reset-password", AuthController.resetPassword);

module.exports = router;
