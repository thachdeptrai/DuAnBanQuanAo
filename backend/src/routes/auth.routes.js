// src/routes/auth.routes.js

import express from "express";
const router = express.Router();
import { authMiddleware } from "../middlewares/authMiddleware.js";

// ⭐ Thay thế import * as AuthController... bằng Default Import
import AuthController from "../controllers/auth.controller.js";

// --- CÁC ROUTE CƠ BẢN ---
// Giữ nguyên cách gọi AuthController.register
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// --- CÁC ROUTE QUẢN LÝ TÀI KHOẢN ---
router.post("/logout", AuthController.logout);
router.post("/change-password", authMiddleware, AuthController.changePassword);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

export default router;
