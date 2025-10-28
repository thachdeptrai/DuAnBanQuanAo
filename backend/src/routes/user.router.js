// src/routes/user.route.js (hoặc user.route.mjs)

import express from "express";
const router = express.Router();

// 1. Import Middleware (Named Import)
import { authMiddleware } from "../middlewares/authMiddleware.js";

// 2. Import Controller (Named Import)
// Giả định user.controller.js sử dụng Named Exports (export const getUserInfo = ...)
import {
  getUserInfo,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js"; // Nhớ thêm đuôi .js

// =======================================================
// Route lấy thông tin người dùng (cần login)
router.get("/me", authMiddleware, getUserInfo);

// Route cập nhật thông tin người dùng (chỉ chính mình)
router.put("/me", authMiddleware, updateUser);

// Route xóa người dùng (chỉ chính mình, yêu cầu password xác nhận)
router.delete("/me", authMiddleware, deleteUser);

// Thay thế module.exports = router;
export default router;
