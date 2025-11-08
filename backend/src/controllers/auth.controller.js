import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../model/user.model.js"; // Đảm bảo đã sửa lỗi import pool
import Otp from "../model/otp.model.js"; // Import Model Otp giả định
import crypto from "crypto";
import { sendOtp } from "./otp.controller.js"; // Giữ lại import sendOtp

// Đảm bảo biến môi trường được load
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || "supersecretaccess";

// =========================================================================
// HÀM TIỆN ÍCH NỘI BỘ
// =========================================================================

/**
 * @desc Tạo một token đặt lại mật khẩu ngẫu nhiên và an toàn.
 * @returns {string} Token hex 64 ký tự.
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Hàm giả định gửi email (cần thay thế bằng service email thực tế)
const sendEmail = (to, subject, body) =>
  console.log(
    `[EMAIL SERVICE] Sending email to ${to}: ${subject}. Body content: ${body}`
  );

// Giả định một kho lưu trữ token TẠM THỜI (thay thế cho Redis/DB Reset Token Table)
const DB_ResetToken_Store = {
  // store: { token: { userId, expiresAt } }
  store: {},
  create: (userId, token) => {
    DB_ResetToken_Store.store[token] = {
      userId,
      expiresAt: Date.now() + 3600000, // Hết hạn sau 1 giờ
    };
  },
  findByToken: (token) => {
    const data = DB_ResetToken_Store.store[token];
    if (data && data.expiresAt > Date.now()) {
      return { id: data.userId };
    }
    DB_ResetToken_Store.delete(token); // Xóa token hết hạn
    return null;
  },
  delete: (token) => {
    delete DB_ResetToken_Store.store[token];
  },
};

// Hàm kiểm tra độ mạnh mật khẩu chuẩn hóa: trả về MẢNG các lỗi
const isStrongPassword = (password) => {
  const errors = [];
  if (password.length < 7) {
    errors.push("phải có ít nhất 7 ký tự");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("phải chứa ít nhất 1 chữ cái viết hoa");
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push("phải chứa ít nhất 1 ký tự đặc biệt");
  }
  return errors;
};

// =========================================================================
// AUTH CONTROLLER CHÍNH
// =========================================================================
const AuthController = {
  // --------------------------------------------------
  // Đăng nhập (LOGIN)
  // --------------------------------------------------
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" }); // BƯỚC FIX: Tiêu chuẩn hóa email trước khi tìm kiếm

      const standardizedEmail = email.toLowerCase().trim(); // ✅ Đã được bảo vệ: email đã có giá trị ở đây

      const user = await UserModel.findByEmail(standardizedEmail);
      if (!user)
        return res.status(404).json({ message: "Không tìm thấy tài khoản" });

      // LOG DEBUG ĐỂ KIỂM TRA MẬT KHẨU
      if (user.password) {
        console.log(
          `[AUTH-DEBUG] Hash DB: ${user.password.substring(0, 10)}...`
        );
      } else {
        console.log(`[AUTH-DEBUG] LỖI: user.password bị thiếu hoặc null!`);
        return res
          .status(500)
          .json({ message: "Lỗi nội bộ: Không tìm thấy mật khẩu người dùng." });
      }
      console.log(`[AUTH-DEBUG] Password Input Length: ${password.length}`);

      const isMatch = await bcrypt.compare(password, user.password);
      console.log(`[AUTH-DEBUG] bcrypt.compare result: ${isMatch}`);

      if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        message: "Đăng nhập thành công",
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
        },
      });
    } catch (err) {
      console.error("[ERROR] AuthController.login:", err);
      res.status(500).json({ message: "Lỗi server" });
    }
  }, // -------------------------------------------------- // BƯỚC 1: YÊU CẦU OTP & KIỂM TRA ĐIỀU KIỆN (Endpoint: /auth/register/request-otp) // --------------------------------------------------

  async requestOtpForRegistration(req, res) {
    try {
      let { name, email, password } = req.body; // 1. Validate: Kiểm tra thông tin bắt buộc

      if (!name || !email || !password)
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc" }); // BƯỚC FIX: Tiêu chuẩn hóa email cho toàn bộ quy trình

      email = email.toLowerCase().trim();
      req.body.email = email; // Ghi đè email đã chuẩn hóa vào body để hàm sendOtp sử dụng

      if (typeof email !== "string" || email.length === 0) {
        return res
          .status(400)
          .json({ message: "Email không hợp lệ hoặc bị bỏ trống." });
      } // 2. Validate Cải tiến: Kiểm tra độ mạnh mật khẩu

      const passwordErrors = isStrongPassword(password);
      if (passwordErrors.length > 0) {
        const errorMessage = `Mật khẩu không hợp lệ: ${passwordErrors.join(
          ", "
        )}.`;
        return res.status(400).json({
          message: errorMessage,
          details: passwordErrors,
        });
      } // DEBUG: Ghi log giá trị email trước khi gọi Model

      console.log(
        `[AUTH-DEBUG] Checking registration for standardized email: ${email}`
      ); // 3. Validate: Kiểm tra email đã tồn tại trong DB USER VĨNH VIỄN

      const existing = await UserModel.findByEmail(email);
      if (existing)
        return res
          .status(400)
          .json({ message: "Email đã tồn tại và đã được đăng ký." }); // 4. Hành động: Gửi OTP (sử dụng email đã được chuẩn hóa)

      return sendOtp(req, res);
    } catch (err) {
      console.error("[ERROR] AuthController.requestOtpForRegistration:", err);
      res.status(500).json({ message: "Lỗi server khi gửi OTP." });
    }
  }, // -------------------------------------------------- // BƯỚC 2: XÁC THỰC OTP VÀ HOÀN TẤT ĐĂNG KÝ (Endpoint: /auth/register/finalize) // --------------------------------------------------

  async registerWithOtp(req, res) {
    try {
      let { name, email, password, code } = req.body; // Dùng 'let' để có thể gán lại // Kiểm tra thông tin đầu vào

      if (!name || !email || !password || !code)
        return res
          .status(400)
          .json({ message: "Thiếu thông tin đăng ký hoặc mã OTP." }); // BƯỚC FIX: Tiêu chuẩn hóa email trước khi tìm kiếm OTP và tạo user

      email = email.toLowerCase().trim(); // 1. Kiểm tra OTP từ Otp Model (Giả định Otp Model sử dụng Sequelize/DB như mô tả của bạn)

      const otpEntry = await Otp.findOne({
        // Đảm bảo email tìm kiếm khớp với email đã lưu (nên là email đã chuẩn hóa)
        where: { email, code },
        order: [["created_at", "DESC"]],
      });

      if (!otpEntry)
        return res
          .status(400)
          .json({ message: "Mã OTP không hợp lệ hoặc không tồn tại." });

      const now = new Date();
      if (now > otpEntry.expires_at) {
        // Xóa OTP hết hạn
        await Otp.destroy({ where: { id: otpEntry.id } });
        return res.status(400).json({ message: "Mã OTP đã hết hạn." });
      } // 2. Nếu OTP hợp lệ, HASH và TẠO NGƯỜI DÙNG VĨNH VIỄN

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = await UserModel.createUser({
        name, // LƯU EMAIL ĐÃ CHUẨN HÓA VÀO DB
        email,
        password: hashedPassword, // Giả định role mặc định là 'customer'
        role: "customer",
      }); // 3. Xóa tất cả OTP đã sử dụng cho email này

      await Otp.destroy({ where: { email } });

      res.status(201).json({
        message: "Đăng ký thành công!",
        userId,
      });
    } catch (err) {
      console.error("[ERROR] AuthController.registerWithOtp:", err); // Xử lý lỗi trùng email (nếu UserModel.createUser không check)
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Email đã được đăng ký." });
      }
      res.status(500).json({ message: "Lỗi server khi hoàn tất đăng ký." });
    }
  }, // -------------------------------------------------- // Đăng xuất (LOGOUT) // --------------------------------------------------

  async logout(req, res) {
    // Với JWT, chỉ cần gửi thông báo xác nhận thành công.
    res.status(200).json({ message: "Đăng xuất thành công." });
  }, // -------------------------------------------------- // Đổi Mật khẩu (CHANGE PASSWORD) - Yêu cầu Token // --------------------------------------------------

  async changePassword(req, res) {
    // Giả định req.user đã được gán bởi middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Chưa xác thực." });
    }

    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Thiếu mật khẩu cũ hoặc mật khẩu mới." });
      } // 1. Kiểm tra độ mạnh mật khẩu mới

      const passwordErrors = isStrongPassword(newPassword);
      if (passwordErrors.length > 0) {
        const errorMessage = `Mật khẩu mới không hợp lệ: ${passwordErrors.join(
          ", "
        )}.`;
        return res.status(400).json({
          message: errorMessage,
          details: passwordErrors,
        });
      } // 2. Lấy user để so sánh mật khẩu cũ

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy tài khoản người dùng." });
      } // 3. So sánh mật khẩu cũ

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Mật khẩu cũ không đúng." });
      } // 4. Hash và cập nhật mật khẩu mới

      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      await UserModel.updatePassword(user.id, newHashedPassword);

      res.status(200).json({ message: "Đổi mật khẩu thành công." });
    } catch (err) {
      console.error("[ERROR] AuthController.changePassword:", err);
      res.status(500).json({ message: "Lỗi server" });
    }
  }, // -------------------------------------------------- // LẤY LẠI MẬT KHẨU (FORGOT PASSWORD) - BƯỚC 1: Gửi Token // --------------------------------------------------

  async forgotPassword(req, res) {
    try {
      let { email } = req.body;
      if (!email) {
        return res
          .status(400)
          .json({ message: "Vui lòng cung cấp email đăng ký." });
      } // BƯỚC FIX: Tiêu chuẩn hóa email

      email = email.toLowerCase().trim();

      const user = await UserModel.findByEmail(email); // LUÔN trả về thông báo thành công chung để tránh lộ email

      if (!user) {
        return res.status(200).json({
          message:
            "Nếu tài khoản tồn tại, đường link đặt lại mật khẩu đã được gửi đến email của bạn.",
        });
      } // 1. Tạo và Lưu Token Đặt lại Mật khẩu (Reset Token)

      const resetToken = generateResetToken();
      DB_ResetToken_Store.create(user.id, resetToken); // Lưu vào kho tạm thời // 2. Gửi email chứa link đặt lại mật khẩu

      const resetURL = `http://your-app/reset-password?token=${resetToken}`;
      sendEmail(
        user.email,
        "Yêu cầu Đặt lại Mật khẩu",
        `Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng truy cập liên kết sau: ${resetURL}`
      );

      res.status(200).json({
        message: "Đường link đặt lại mật khẩu đã được gửi đến email của bạn.",
      });
    } catch (err) {
      console.error("[ERROR] AuthController.forgotPassword:", err);
      res.status(500).json({ message: "Lỗi server" });
    }
  }, // -------------------------------------------------- // LẤY LẠI MẬT KHẨU (FORGOT PASSWORD) - BƯỚC 2: Đặt lại Mật khẩu // --------------------------------------------------

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res
          .status(400)
          .json({ message: "Thiếu token hoặc mật khẩu mới." });
      } // 1. Tìm kiếm User qua Token và kiểm tra thời gian hết hạn

      const user = DB_ResetToken_Store.findByToken(token);
      if (!user) {
        return res
          .status(400)
          .json({ message: "Token không hợp lệ hoặc đã hết hạn." });
      } // 2. Kiểm tra độ mạnh mật khẩu mới

      const passwordErrors = isStrongPassword(newPassword);
      if (passwordErrors.length > 0) {
        const errorMessage = `Mật khẩu mới không hợp lệ: ${passwordErrors.join(
          ", "
        )}.`;
        return res.status(400).json({
          message: errorMessage,
          details: passwordErrors,
        });
      } // 3. Hash và cập nhật mật khẩu

      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      await UserModel.updatePassword(user.id, newHashedPassword); // 4. Xóa Token khỏi DB để không thể sử dụng lại

      DB_ResetToken_Store.delete(token);

      res.status(200).json({
        message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
      });
    } catch (err) {
      console.error("[ERROR] AuthController.resetPassword:", err);
      res.status(500).json({ message: "Lỗi server" });
    }
  },
};

export default AuthController;
