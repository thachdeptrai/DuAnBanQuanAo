// routes/user.routes.js
import express from "express";
import {
  authMiddleware,
  userMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";
import UserController from "../controllers/user.controller.js";

const router = express.Router();

// ==================================================
// 🔹 USER ROUTES (cần token + role = customer)
// ==================================================
router.get(
  "/profile",
  authMiddleware,
  userMiddleware,
  UserController.getProfile
);
router.put(
  "/profile",
  authMiddleware,
  userMiddleware,
  UserController.updateProfile
);

router.put(
  "/change-password",
  authMiddleware,
  userMiddleware,
  UserController.changePassword
);

router.delete(
  "/account",
  authMiddleware,
  userMiddleware,
  UserController.deleteAccount
);

router.get(
  "/statistics",
  authMiddleware,
  userMiddleware,
  UserController.getStatistics
);

export default router;
