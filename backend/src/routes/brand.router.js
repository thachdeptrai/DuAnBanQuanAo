import express from "express";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.controller.js";

const router = express.Router();

// Cấu hình multer để upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `brand_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// ---------------- ROUTES ----------------
router.get("/", getAllBrands);
router.get("/:id", getBrandById);
router.post("/", authMiddleware, upload.single("logo"), createBrand);
router.put("/:id", authMiddleware, upload.single("logo"), updateBrand);
router.delete("/:id", authMiddleware, deleteBrand);

export default router;
