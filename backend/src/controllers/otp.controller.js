import Otp from "../model/otp.model.js";
import nodemailer from "nodemailer";

/**
 * 📤 Gửi OTP
 */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email là bắt buộc" });

    const now = new Date();

    // 1️⃣ Kiểm tra nếu gửi trong vòng 1 phút
    const lastOtp = await Otp.findOne({
      where: { email },
      order: [["created_at", "DESC"]],
    });

    if (lastOtp && (now - lastOtp.created_at) / 1000 < 60) {
      const remain = 60 - Math.floor((now - lastOtp.created_at) / 1000);
      return res
        .status(429)
        .json({ message: `Vui lòng đợi ${remain}s trước khi gửi lại mã OTP.` });
    }

    // 2️⃣ Tạo OTP mới
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 phút

    // 3️⃣ Xóa OTP cũ
    await Otp.destroy({ where: { email } });

    // 4️⃣ Lưu OTP mới
    await Otp.create({
      email,
      code: otpCode,
      created_at: now,
      expires_at: expiresAt,
    });

    // 5️⃣ Gửi OTP qua email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // dùng SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SweetShop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Mã OTP của bạn",
      text: `Mã OTP của bạn là ${otpCode}. Mã có hiệu lực trong 5 phút.`,
    });

    res.json({ message: "OTP đã được gửi thành công!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống khi gửi OTP." });
  }
};

/**
 * ✅ Xác thực OTP
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: "Thiếu email hoặc mã OTP." });

    const otp = await Otp.findOne({
      where: { email, code },
      order: [["created_at", "DESC"]],
    });

    if (!otp) return res.status(400).json({ message: "Mã OTP không hợp lệ." });

    const now = new Date();
    if (now > otp.expires_at)
      return res.status(400).json({ message: "Mã OTP đã hết hạn." });

    // ✅ Xóa OTP sau khi xác thực thành công
    await Otp.destroy({ where: { email } });

    res.json({ message: "Xác thực OTP thành công!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống khi xác thực OTP." });
  }
};
