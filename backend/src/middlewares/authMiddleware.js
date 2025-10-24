// src/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");

// Lấy secret key từ biến môi trường.
// Dùng giá trị mặc định chỉ khi biết chắc chắn biến môi trường không được set.
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "supersecretaccess";

/**
 * Middleware: Yêu cầu xác thực (Authorization Middleware)
 * Kiểm tra header 'Authorization' để xác minh token JWT hợp lệ.
 * * @param {object} req - Đối tượng Request
 * @param {object} res - Đối tượng Response
 * @param {function} next - Hàm tiếp tục xử lý
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];

  // 1. Kiểm tra sự tồn tại của header Authorization
  if (!authHeader) {
    return res.status(401).json({
      message: "Thiếu thông tin xác thực (Authorization header missing).",
    });
  }

  // Kiểm tra định dạng: Phải là "Bearer [token]"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      message: 'Định dạng token không hợp lệ. Phải là "Bearer <token>".',
    });
  }

  const token = parts[1];

  // 2. Xác minh Token
  try {
    // Giải mã token bằng secret key
    const payload = jwt.verify(token, JWT_ACCESS_SECRET);

    // Gắn thông tin người dùng (id, role, email) vào request
    // Các controller tiếp theo có thể truy cập: req.user.id, req.user.role, ...
    req.user = payload;

    // Chuyển sang middleware hoặc controller tiếp theo
    next();
  } catch (error) {
    // Xử lý các lỗi JWT cụ thể
    console.error("JWT Verification Error:", error.message);

    let errorMessage = "Token không hợp lệ.";

    if (error.name === "TokenExpiredError") {
      errorMessage = "Token đã hết hạn.";
    } else if (error.name === "JsonWebTokenError") {
      errorMessage = "Token bị lỗi hoặc chữ ký không khớp.";
    }

    return res.status(401).json({ message: errorMessage });
  }
}

// Export middleware dưới tên authMiddleware
module.exports = { authMiddleware: requireAuth };
