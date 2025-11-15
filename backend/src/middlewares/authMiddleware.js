// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * 🛡️ HỆ THỐNG XÁC THỰC VÀ PHÂN QUYỀN CHO SWEETSHOP
 *
 * Middleware quản lý việc đăng nhập, phân quyền và bảo mật cho ứng dụng
 */

// =====================================================
// 🎯 CẤU HÌNH VÀ HẰNG SỐ
// =====================================================

// 🔐 Lấy mã bí mật từ biến môi trường
const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "supersecretaccesskey_2024_sweetshop_secure";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "supersecretrefreshkey_2024_sweetshop_secure";

/**
 * 🎯 DANH SÁCH TRƯỜNG DỮ LIỆU USER MODEL
 * Đảm bảo thống nhất với database schema
 */
const USER_FIELDS = {
  ID: "id",
  NAME: "name",
  EMAIL: "email",
  PASSWORD: "password", // Chỉ dùng cho đăng nhập, không trả về client
  PHONE: "phone",
  ADDRESS: "address",
  AVATAR: "avatar",
  ROLE: "role", // ['customer', 'admin']
  STATUS: "status", // ['active', 'inactive']
  EMAIL_VERIFIED: "email_verified",
  VERIFICATION_ATTEMPTS: "verification_attempts", // Chỉ dùng nội bộ
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

// =====================================================
// 🔧 TIỆN ÍCH HỖ TRỢ
// =====================================================

/**
 * 🔍 TRÍCH XUẤT TOKEN TỪ REQUEST
 * Tìm token trong header Authorization hoặc cookie
 */
const extractToken = (req) => {
  console.log("🔍 Đang tìm token trong request...");

  // 1. Tìm trong header Authorization
  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    console.log("✅ Tìm thấy token trong Authorization header");
    return authHeader.split(" ")[1];
  }

  // 2. Tìm trong cookies
  if (req.cookies?.accessToken) {
    console.log("✅ Tìm thấy token trong cookie");
    return req.cookies.accessToken;
  }

  console.log("❌ Không tìm thấy token trong request");
  return null;
};

/**
 * 🛡️ LỌC THÔNG TIN USER AN TOÀN
 * Loại bỏ các trường nhạy cảm trước khi trả về client
 */
const getUserSafeFields = (user) => {
  console.log("🛡️ Đang lọc thông tin user an toàn...");
  return {
    [USER_FIELDS.ID]: user[USER_FIELDS.ID],
    [USER_FIELDS.NAME]: user[USER_FIELDS.NAME],
    [USER_FIELDS.EMAIL]: user[USER_FIELDS.EMAIL],
    [USER_FIELDS.PHONE]: user[USER_FIELDS.PHONE],
    [USER_FIELDS.ADDRESS]: user[USER_FIELDS.ADDRESS],
    [USER_FIELDS.AVATAR]: user[USER_FIELDS.AVATAR],
    [USER_FIELDS.ROLE]: user[USER_FIELDS.ROLE],
    [USER_FIELDS.STATUS]: user[USER_FIELDS.STATUS],
    [USER_FIELDS.EMAIL_VERIFIED]: user[USER_FIELDS.EMAIL_VERIFIED],
    [USER_FIELDS.CREATED_AT]: user[USER_FIELDS.CREATED_AT],
    [USER_FIELDS.UPDATED_AT]: user[USER_FIELDS.UPDATED_AT],
  };
};

/**
 * 📋 KIỂM TRA TRẠNG THÁI USER
 * Đảm bảo user active
 */
const validateUserStatus = (user) => {
  console.log("📋 Đang kiểm tra trạng thái user...");

  if (user[USER_FIELDS.STATUS] !== "active") {
    throw new Error(`Tài khoản đang ở trạng thái: ${user[USER_FIELDS.STATUS]}`);
  }

  console.log("✅ Trạng thái user hợp lệ");
  return true;
};

// =====================================================
// 🔐 MIDDLEWARE XÁC THỰC TOKEN
// =====================================================

/**
 * 🛡️ MIDDLEWARE XÁC THỰC TOKEN CHÍNH
 * Kiểm tra và xác thực JWT token từ request
 */
export const authMiddleware = (req, res, next) => {
  console.log("\n==========================================");
  console.log("🔐 BẮT ĐẦU KIỂM TRA TOKEN XÁC THỰC");

  const token = extractToken(req);

  // ❌ KHÔNG CÓ TOKEN
  if (!token) {
    console.log("❌ Không tìm thấy token - Từ chối truy cập");
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập để tiếp tục",
      code: "THIEU_TOKEN",
    });
  }

  try {
    console.log("🔎 Đang xác thực token...");

    // 🔓 GIẢI MÃ TOKEN
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    console.log("✅ Token hợp lệ - Thông tin user:", {
      id: decoded[USER_FIELDS.ID],
      email: decoded[USER_FIELDS.EMAIL],
      role: decoded[USER_FIELDS.ROLE],
    });

    // 👨‍💼 XỬ LÝ ADMIN CỨNG (cho lần đăng nhập đầu)
    if (decoded[USER_FIELDS.ID] === "admin_initial") {
      console.log("⚡ Đang sử dụng tài khoản admin cứng");
      req.user = {
        [USER_FIELDS.ID]: "admin_initial",
        [USER_FIELDS.NAME]: "Nguyen Dat Admin",
        [USER_FIELDS.EMAIL]: process.env.HARDCODED_ADMIN_EMAIL, // ✅ SỬA LẠI Ở ĐÂY
        [USER_FIELDS.ROLE]: "admin",
        [USER_FIELDS.STATUS]: "active",
        [USER_FIELDS.EMAIL_VERIFIED]: true,
      };
      console.log("✅ Xác thực admin cứng thành công");
    } else {
      // 👤 XỬ LÝ USER THÔNG THƯỜNG
      req.user = {
        [USER_FIELDS.ID]: decoded[USER_FIELDS.ID],
        [USER_FIELDS.NAME]: decoded[USER_FIELDS.NAME],
        [USER_FIELDS.EMAIL]: decoded[USER_FIELDS.EMAIL],
        [USER_FIELDS.ROLE]: decoded[USER_FIELDS.ROLE],
        [USER_FIELDS.STATUS]: decoded[USER_FIELDS.STATUS],
        [USER_FIELDS.EMAIL_VERIFIED]: decoded[USER_FIELDS.EMAIL_VERIFIED],
        [USER_FIELDS.PHONE]: decoded[USER_FIELDS.PHONE],
        [USER_FIELDS.ADDRESS]: decoded[USER_FIELDS.ADDRESS],
        [USER_FIELDS.AVATAR]: decoded[USER_FIELDS.AVATAR],
      };
      console.log("✅ Xác thực user thường thành công");
    }

    console.log("➡️ Cho phép tiếp tục...");
    console.log("==========================================\n");
    next();
  } catch (error) {
    console.error("❌ LỖI XÁC THỰC TOKEN:", error.name, "-", error.message);

    let message = "Token không hợp lệ";
    let code = "TOKEN_KHONG_HOP_LE";

    // 🕐 TOKEN HẾT HẠN
    if (error.name === "TokenExpiredError") {
      message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại";
      code = "TOKEN_HET_HAN";
    }
    // 🚫 TOKEN KHÔNG HỢP LỆ
    else if (error.name === "JsonWebTokenError") {
      message = "Token không đúng định dạng hoặc đã bị sửa đổi";
      code = "TOKEN_SAI_DINH_DANG";
    }

    console.log(`❌ Từ chối truy cập: ${message}`);
    return res.status(401).json({
      success: false,
      message,
      code,
    });
  }
};

// =====================================================
// 👑 MIDDLEWARE KIỂM TRA QUYỀN ADMIN
// =====================================================

/**
 * 👑 MIDDLEWARE CHỈ CHO PHÉP ADMIN
 * Kiểm tra user có role admin và tài khoản active
 */
export const adminMiddleware = (req, res, next) => {
  console.log("\n🔍 KIỂM TRA QUYỀN QUẢN TRỊ VIÊN");

  // ❌ CHƯA ĐĂNG NHẬP
  if (!req.user) {
    console.log("❌ Chưa đăng nhập - Không thể kiểm tra quyền admin");
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập trước",
      code: "CHUA_DANG_NHAP",
    });
  }

  console.log(
    `👤 User hiện tại: ${req.user[USER_FIELDS.EMAIL]} (${
      req.user[USER_FIELDS.ROLE]
    })`
  );

  // ❌ KHÔNG PHẢI ADMIN
  if (req.user[USER_FIELDS.ROLE] !== "admin") {
    console.log(
      `❌ User không có quyền admin - Role: ${req.user[USER_FIELDS.ROLE]}`
    );
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền truy cập tính năng này",
      code: "KHONG_CO_QUYEN_ADMIN",
    });
  }

  // ❌ TÀI KHOẢN KHÔNG ACTIVE
  if (req.user[USER_FIELDS.STATUS] !== "active") {
    console.log("❌ Tài khoản admin không active");
    return res.status(403).json({
      success: false,
      message: "Tài khoản quản trị đã bị vô hiệu hóa",
      code: "TAI_KHOAN_ADMIN_BI_VO_HIEU",
    });
  }

  console.log("✅ Quyền admin hợp lệ - Cho phép tiếp tục");
  next();
};

// =====================================================
// 👤 MIDDLEWARE KIỂM TRA QUYỀN USER
// =====================================================

/**
 * 👤 MIDDLEWARE CHO USER THÔNG THƯỜNG
 * Kiểm tra user có role customer hoặc admin
 */
export const userMiddleware = (req, res, next) => {
  console.log("\n🔍 KIỂM TRA QUYỀN NGƯỜI DÙNG");

  // ❌ CHƯA ĐĂNG NHẬP
  if (!req.user) {
    console.log("❌ Chưa đăng nhập - Không thể kiểm tra quyền user");
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập trước",
      code: "CHUA_DANG_NHAP",
    });
  }

  console.log(
    `👤 User hiện tại: ${req.user[USER_FIELDS.EMAIL]} (${
      req.user[USER_FIELDS.ROLE]
    })`
  );

  // ✅ CÁC ROLE HỢP LỆ
  const validRoles = ["customer", "admin"];
  if (!validRoles.includes(req.user[USER_FIELDS.ROLE])) {
    console.log(`❌ Role không hợp lệ: ${req.user[USER_FIELDS.ROLE]}`);
    return res.status(403).json({
      success: false,
      message: "Tài khoản không có quyền truy cập",
      code: "ROLE_KHONG_HOP_LE",
    });
  }

  // ❌ TÀI KHOẢN KHÔNG ACTIVE
  if (req.user[USER_FIELDS.STATUS] !== "active") {
    console.log("❌ Tài khoản user không active");
    return res.status(403).json({
      success: false,
      message: "Tài khoản của bạn đã bị khóa",
      code: "TAI_KHOAN_BI_KHOA",
    });
  }

  console.log("✅ Quyền user hợp lệ - Cho phép tiếp tục");
  next();
};

// =====================================================
// 🔒 MIDDLEWARE KIỂM TRA QUYỀN SỞ HỮU
// =====================================================

/**
 * 🔒 MIDDLEWARE CHỦ SỞ HỮU HOẶC ADMIN
 * Cho phép user truy cập tài nguyên của chính mình hoặc admin truy cập tất cả
 */
export const ownerOrAdminMiddleware = (req, res, next) => {
  const resourceId = req.params.userId || req.params.id;
  const currentUserId = req.user?.[USER_FIELDS.ID];

  console.log(`\n🔍 KIỂM TRA QUYỀN SỞ HỮU`);
  console.log(`👤 User hiện tại: ${currentUserId}`);
  console.log(`📦 Tài nguyên yêu cầu: ${resourceId}`);

  // ❌ CHƯA ĐĂNG NHẬP
  if (!req.user) {
    console.log("❌ Chưa đăng nhập - Không thể kiểm tra quyền sở hữu");
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập trước",
      code: "CHUA_DANG_NHAP",
    });
  }

  // ✅ ADMIN CÓ TOÀN QUYỀN
  if (req.user[USER_FIELDS.ROLE] === "admin") {
    console.log("✅ Admin có toàn quyền - Cho phép truy cập");
    return next();
  }

  // ✅ KIỂM TRA CHỦ SỞ HỮU
  const isOwner =
    currentUserId === resourceId ||
    currentUserId?.toString() === resourceId?.toString();

  if (isOwner) {
    console.log("✅ User là chủ sở hữu - Cho phép truy cập");
    return next();
  }

  // ❌ KHÔNG CÓ QUYỀN
  console.log("❌ User không phải chủ sở hữu và không phải admin");
  return res.status(403).json({
    success: false,
    message: "Bạn chỉ có quyền truy cập tài nguyên của chính mình",
    code: "KHONG_CO_QUYEN_TRUY_CAP",
  });
};

// =====================================================
// 🎯 XUẤT CÁC HẰNG SỐ VÀ TIỆN ÍCH
// =====================================================

export const USER_MODEL_FIELDS = USER_FIELDS;
export { getUserSafeFields, validateUserStatus };

export default {
  authMiddleware,
  adminMiddleware,
  userMiddleware,
  ownerOrAdminMiddleware,
  USER_MODEL_FIELDS,
  getUserSafeFields,
};
