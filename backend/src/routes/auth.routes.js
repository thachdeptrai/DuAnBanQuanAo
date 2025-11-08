// src/routes/auth.routes.js

import express from "express";
const router = express.Router();
import { authMiddleware } from "../middlewares/authMiddleware.js";

// ⭐ Thay thế import * as AuthController... bằng Default Import
import AuthController from "../controllers/auth.controller.js";

// --- CÁC ROUTE CƠ BẢN ---
// Giữ nguyên cách gọi AuthController.register
// ✅ 1. BƯỚC 1: Gửi yêu cầu đăng ký và OTP
router.post("/register/request-otp", AuthController.requestOtpForRegistration);

// ✅ 2. BƯỚC 2: Xác thực OTP và tạo tài khoản vĩnh viễn
router.post("/register/finalize", AuthController.registerWithOtp);
router.post("/login", AuthController.login);

// --- CÁC ROUTE QUẢN LÝ TÀI KHOẢN ---
router.post("/logout", AuthController.logout);
router.post("/change-password", authMiddleware, AuthController.changePassword);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

export default router;
