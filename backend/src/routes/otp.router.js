import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otp.controller.js";

const router = express.Router();

router.post("/send", sendOtp); // Gửi OTP
router.post("/verify", verifyOtp); // Xác thực OTP

export default router;
