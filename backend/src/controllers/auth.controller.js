// src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../model/user.model");

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || "supersecretaccess";

// Giả định: Các hàm tiện ích cần thiết cho Forgot/Reset Password
// Trong thực tế, bạn cần triển khai các hàm này.
const generateResetToken = () => "unique_reset_token_123";
const sendEmail = (to, subject, body) =>
  console.log(`Sending email to ${to}: ${subject}`);
const DB_ResetToken_Store = {
  // Giả định một kho lưu trữ token tạm thời: { token: { userId, expiresAt } }
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
      return { id: data.userId }; // Giả định trả về user object
    }
    return null;
  },
  delete: (token) => {
    delete DB_ResetToken_Store.store[token];
  },
};

// ✨ Hàm kiểm tra độ mạnh mật khẩu chuẩn hóa: trả về MẢNG các lỗi
const isStrongPassword = (password) => {
  const errors = [];

  // 1. Yêu cầu: Độ dài tối thiểu 7 ký tự
  if (password.length < 7) {
    errors.push("phải có ít nhất 7 ký tự");
  }

  // 2. Yêu cầu: Ít nhất 1 chữ hoa (uppercase)
  if (!/[A-Z]/.test(password)) {
    errors.push("phải chứa ít nhất 1 chữ cái viết hoa");
  }

  // 3. Yêu cầu: Ít nhất 1 ký tự đặc biệt
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push("phải chứa ít nhất 1 ký tự đặc biệt");
  }

  return errors;
};

const AuthController = {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // 1. Validate: Kiểm tra thông tin bắt buộc
      if (!name || !email || !password)
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

      // ✨ 2. Validate Cải tiến: Kiểm tra độ mạnh mật khẩu và tạo thông báo chuẩn
      const passwordErrors = isStrongPassword(password);
      if (passwordErrors.length > 0) {
        const errorMessage = `Mật khẩu không hợp lệ: ${passwordErrors.join(
          ", "
        )}.`;
        return res.status(400).json({
          message: errorMessage,
          details: passwordErrors,
        });
      }

      // 3. Validate: Kiểm tra email đã tồn tại
      const existing = await UserModel.findByEmail(email);
      if (existing)
        return res.status(400).json({ message: "Email đã tồn tại" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = await UserModel.createUser({
        name,
        email,
        password: hashedPassword,
        role: "customer",
      });

      res.status(201).json({ message: "Đăng ký thành công", userId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });

      const user = await UserModel.findByEmail(email);
      if (!user)
        return res.status(404).json({ message: "Không tìm thấy tài khoản" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        message: "Đăng nhập thành công",
        token,
        user: { id: user.id, name: user.name, role: user.role },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  // --------------------------------------------------
  // ✨ 1. CHỨC NĂNG ĐĂNG XUẤT (LOGOUT)
  // --------------------------------------------------
  async logout(req, res) {
    // Đối với JWT, hành động đăng xuất chủ yếu là xóa token ở phía client.
    // Server chỉ gửi thông báo xác nhận thành công.
    res.status(200).json({ message: "Đăng xuất thành công." });
  },

  // --------------------------------------------------
  // ✨ 2. CHỨC NĂNG ĐỔI MẬT KHẨU (CHANGE PASSWORD) - Yêu cầu Token
  // --------------------------------------------------
  async changePassword(req, res) {
    // Giả định middleware đã chạy và gắn user info vào req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Chưa xác thực." });
    }

    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Thiếu mật khẩu cũ hoặc mật khẩu mới." });
      }

      // 1. Kiểm tra độ mạnh mật khẩu mới
      const passwordErrors = isStrongPassword(newPassword);
      if (passwordErrors.length > 0) {
        const errorMessage = `Mật khẩu mới không hợp lệ: ${passwordErrors.join(
          ", "
        )}.`;
        return res.status(400).json({
          message: errorMessage,
          details: passwordErrors,
        });
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy tài khoản người dùng." });
      }

      // 2. So sánh mật khẩu cũ
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Mật khẩu cũ không đúng." });
      }

      // 3. Hash và cập nhật mật khẩu mới
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      await UserModel.updatePassword(user.id, newHashedPassword);

      res.status(200).json({ message: "Đổi mật khẩu thành công." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  // --------------------------------------------------
  // ✨ 3. CHỨC NĂNG LẤY LẠI MẬT KHẨU (FORGOT PASSWORD) - BƯỚC 1: Gửi Token
  // --------------------------------------------------
  async forgotPassword(req, res) {
    try {
      // Yêu cầu email để tìm người dùng
      const { email } = req.body;
      if (!email) {
        return res
          .status(400)
          .json({ message: "Vui lòng cung cấp email đăng ký." });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Luôn trả về thông báo thành công chung để tránh lộ email
        return res
          .status(200)
          .json({
            message:
              "Nếu tài khoản tồn tại, đường link đặt lại mật khẩu đã được gửi đến email của bạn.",
          });
      }

      // 1. Tạo và Lưu Token Đặt lại Mật khẩu (Reset Token)
      const resetToken = generateResetToken();
      DB_ResetToken_Store.create(user.id, resetToken); // Lưu vào DB với thời gian hết hạn (ví dụ: 1 giờ)

      // 2. Gửi email chứa link đặt lại mật khẩu
      const resetURL = `http://your-app/reset-password?token=${resetToken}`;
      sendEmail(
        user.email,
        "Yêu cầu Đặt lại Mật khẩu",
        `Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng truy cập liên kết sau: ${resetURL}`
      );

      res
        .status(200)
        .json({
          message: "Đường link đặt lại mật khẩu đã được gửi đến email của bạn.",
        });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  // --------------------------------------------------
  // ✨ 4. CHỨC NĂNG LẤY LẠI MẬT KHẨU (FORGOT PASSWORD) - BƯỚC 2: Đặt lại Mật khẩu
  // --------------------------------------------------
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res
          .status(400)
          .json({ message: "Thiếu token hoặc mật khẩu mới." });
      }

      // 1. Tìm kiếm User qua Token và kiểm tra thời gian hết hạn
      const user = DB_ResetToken_Store.findByToken(token);
      if (!user) {
        return res
          .status(400)
          .json({ message: "Token không hợp lệ hoặc đã hết hạn." });
      }

      // 2. Kiểm tra độ mạnh mật khẩu mới
      const passwordErrors = isStrongPassword(newPassword);
      if (passwordErrors.length > 0) {
        const errorMessage = `Mật khẩu mới không hợp lệ: ${passwordErrors.join(
          ", "
        )}.`;
        return res.status(400).json({
          message: errorMessage,
          details: passwordErrors,
        });
      }

      // 3. Hash và cập nhật mật khẩu
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      await UserModel.updatePassword(user.id, newHashedPassword);

      // 4. Xóa Token khỏi DB để không thể sử dụng lại
      DB_ResetToken_Store.delete(token);

      res
        .status(200)
        .json({
          message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
        });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi server" });
    }
  },
};

module.exports = AuthController;
