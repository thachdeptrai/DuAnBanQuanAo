import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

// Models
import models from "../model/init.js";
const { User, OTPCode, sequelize } = models; // ✅ ĐÃ IMPORT SEQUELIZE
const USER_FIELDS = {
  ID: "id",
  NAME: "name",
  EMAIL: "email",
  PASSWORD: "password",
  PHONE: "phone",
  ADDRESS: "address",
  AVATAR: "avatar",
  ROLE: "role",
  STATUS: "status",
  EMAIL_VERIFIED: "email_verified",
  VERIFICATION_ATTEMPTS: "verification_attempts",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};
// Services
import {
  sendOtp, // Dùng cho API forgotPassword
  verifyOtpService, // Dùng cho logic resetPassword (với transaction)
  invalidateOtpService, // Dùng cho logic resetPassword (với transaction)
} from "./otp.controller.js"; // Đổi tên file cho phù hợp nếu cần
// Config
const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "supersecretaccesskey_2024_sweetshop_secure";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "supersecretrefreshkey_2024_sweetshop_secure";
const HASH_SALT_ROUNDS = 12;

class AuthController {
  // =========================================================
  // 🔹 ĐĂNG KÝ: Gửi OTP
  // =========================================================
  async requestOtpForRegistration(req, res) {
    try {
      console.log("📧 Bắt đầu gửi OTP đăng ký...");
      const { email } = req.body;

      // Validation
      if (!email) {
        console.log("❌ Thiếu email");
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp email.",
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log("❌ Email không hợp lệ:", email);
        return res.status(400).json({
          success: false,
          message: "Email không hợp lệ.",
        });
      }

      // 🎯 SỬA ĐỔI: Check existing user CHỈ NẾU status là "active"
      // Điều này cho phép người dùng đăng ký lại nếu tài khoản cũ có status là "deleted"
      const existingActiveUser = await User.findOne({
        where: {
          email,
          status: "active", // CHỈ TÌM KIẾM TÀI KHOẢN ĐANG HOẠT ĐỘNG
        },
      });

      if (existingActiveUser) {
        console.log("❌ Email đã tồn tại và đang active:", email);
        return res.status(409).json({
          success: false,
          message: "Email đã tồn tại trong hệ thống. Vui lòng đăng nhập.",
        });
      }

      console.log("✅ Email hợp lệ, chuyển sang gửi OTP...");

      // Reuse OTP service
      req.body.type = "register";
      return sendOtp(req, res);
    } catch (error) {
      console.error("❌ Lỗi gửi OTP đăng ký:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi yêu cầu OTP đăng ký.",
      });
    }
  }

  // =========================================================
  // 🔹 HOÀN TẤT ĐĂNG KÝ
  // =========================================================
  registerWithOtp = async (req, res) => {
    const transaction = await sequelize.transaction();
    console.log("🔄 Bắt đầu Transaction cho đăng ký...");

    try {
      const { email, password, otp } = req.body;

      // 1. Validation (Giữ nguyên)
      if (!email || !password || !otp) {
        console.log("❌ Thiếu thông tin bắt buộc");
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin bắt buộc: email, mật khẩu hoặc OTP.",
        });
      }

      // 2. Password strength validation (Giữ nguyên)
      const passwordErrors = this.validatePassword(password);
      if (passwordErrors.length > 0) {
        console.log("❌ Mật khẩu yếu:", passwordErrors);
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Mật khẩu không đủ mạnh.",
          errors: passwordErrors,
        });
      }

      // 3. Check OTP validity (Giữ nguyên)
      const otpRecord = await OTPCode.findOne({
        where: { email, code: otp, type: "register" },
        transaction,
      });

      if (!otpRecord) {
        console.log("❌ OTP không hợp lệ cho email:", email);
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Mã OTP không hợp lệ.",
        });
      }

      // 4. Check OTP expiration (Giữ nguyên)
      const now = new Date();
      if (otpRecord.expires_at && now > otpRecord.expires_at) {
        console.log("❌ OTP hết hạn cho email:", email);
        await OTPCode.destroy({
          where: { email, type: "register" },
          transaction,
        });
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Mã OTP đã hết hạn. Vui lòng gửi lại.",
        });
      }

      // ❌ BỎ BƯỚC 5: FINAL CHECK FOR EXISTING USER
      // Việc kiểm tra trùng lặp user đang active đã được thực hiện ở requestOtpForRegistration.
      // Bỏ bước này giúp bạn tạo User mới ngay cả khi user cũ (deleted) tồn tại.

      // 6. Hash password and create user
      console.log("🔐 Đang hash mật khẩu và TẠO USER MỚI...");
      const hashedPassword = await bcrypt.hash(password, HASH_SALT_ROUNDS);

      const newUser = await User.create(
        {
          email,
          password: hashedPassword,
          // Các trường khác như name, phone, address sẽ là NULL/Default
          // => Đảm bảo đây là dữ liệu mới hoàn toàn.
          role: "customer",
          status: "active", // TÀI KHOẢN MỚI CÓ STATUS ACTIVE
          email_verified: true,
        },
        { transaction }
      );

      // 7. Clean up OTP (Giữ nguyên)
      await OTPCode.destroy({
        where: { email, type: "register" },
        transaction,
      });

      // 8. Commit transaction (Giữ nguyên)
      await transaction.commit();
      console.log(
        `✅ Đăng ký thành công (ID mới: ${newUser.id}) cho email: ${email}`
      );

      return res.status(201).json({
        success: true,
        message: "Đăng ký thành công! Vui lòng đăng nhập.",
        data: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi đăng ký:", error);

      // Trường hợp lỗi này chỉ xảy ra nếu ràng buộc UNIQUE trên email CHƯA được xóa
      if (error.name === "SequelizeUniqueConstraintError") {
        console.error(
          "❌ Lỗi Database: Email bị trùng do Unique Constraint còn tồn tại."
        );
        return res.status(409).json({
          success: false,
          message: "Email đã được đăng ký (Lỗi database).",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi hoàn tất đăng ký.",
      });
    }
  };

  // =========================================================
  // 🔹 ĐĂNG NHẬP (ĐÃ BỔ SUNG ADMIN CỨNG)
  // =========================================================
  async login(req, res) {
    try {
      console.log("🔐 Bắt đầu đăng nhập...");
      const { email, password } = req.body;

      // 1. Validation
      if (!email || !password) {
        console.log("❌ Thiếu email hoặc mật khẩu");
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp email và mật khẩu.",
        });
      }

      let user = null;
      let isHardcodedAdmin = false;

      // 🎯 KIỂM TRA ADMIN CỨNG ĐẦU TIÊN
      if (email === process.env.HARDCODED_ADMIN_EMAIL) {
        console.log("👑 Phát hiện admin cứng...");
        const isPasswordValid = await bcrypt.compare(
          password,
          process.env.HARDCODED_ADMIN_HASH
        );

        if (isPasswordValid) {
          isHardcodedAdmin = true;
          user = {
            [USER_FIELDS.ID]: "admin_initial",
            [USER_FIELDS.NAME]: "Nguyen Dat Admin",
            [USER_FIELDS.EMAIL]: process.env.HARDCODED_ADMIN_EMAIL,
            [USER_FIELDS.ROLE]: "admin",
            [USER_FIELDS.STATUS]: "active",
            [USER_FIELDS.EMAIL_VERIFIED]: true,
          };
          console.log("✅ Đăng nhập admin cứng thành công");
        }
      }

      // 2. Nếu không phải admin cứng, tìm user trong database
      if (!isHardcodedAdmin) {
        user = await User.findOne({
          where: { email, status: "active" },
        });

        if (!user) {
          console.log("❌ Email không tồn tại:", email);
          return res.status(401).json({
            success: false,
            message: "Sai email hoặc mật khẩu!",
          });
        }

        // 3. Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          console.log("❌ Sai mật khẩu cho email:", email);
          return res.status(401).json({
            success: false,
            message: "Sai email hoặc mật khẩu!",
          });
        }
        console.log("✅ Đăng nhập user thường thành công");
      }

      // 4. Generate tokens với đầy đủ thông tin
      const tokenPayload = isHardcodedAdmin
        ? user
        : {
            [USER_FIELDS.ID]: user.id,
            [USER_FIELDS.ROLE]: user.role,
            [USER_FIELDS.EMAIL]: user.email,
            [USER_FIELDS.STATUS]: user.status,
            [USER_FIELDS.EMAIL_VERIFIED]: user.email_verified,
            [USER_FIELDS.NAME]: user.name,
            [USER_FIELDS.PHONE]: user.phone,
            [USER_FIELDS.ADDRESS]: user.address,
            [USER_FIELDS.AVATAR]: user.avatar,
          };

      const accessToken = jwt.sign(tokenPayload, JWT_ACCESS_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
        issuer: "sweetshop-api",
        audience: "sweetshop-client",
      });

      const refreshToken = jwt.sign(
        { id: isHardcodedAdmin ? "admin_initial" : user.id, type: "refresh" },
        JWT_REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" }
      );

      // 5. Update last login (chỉ user thường)
      if (!isHardcodedAdmin) {
        await User.update(
          { last_login: new Date() },
          { where: { id: user.id } }
        );
      }

      // 6. Prepare user data
      const userData = isHardcodedAdmin
        ? user
        : {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            avatar: user.avatar,
            phone: user.phone,
            address: user.address,
            status: user.status,
            last_login: user.last_login,
          };

      // 7. Set refresh token cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      console.log("✅ Đăng nhập thành công:", email);
      return res.json({
        success: true,
        message: "Đăng nhập thành công!",
        data: {
          user: userData,
          accessToken,
          expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
        },
      });
    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi đăng nhập.",
      });
    }
  }

  // =========================================================
  // 🔹 ĐẶT LẠI MẬT KHẨU (HOÀN THIỆN)
  // =========================================================

  async resetPassword(req, res) {
    // Bắt đầu một transaction để đảm bảo tính nhất quán của dữ liệu
    const transaction = await sequelize.transaction();

    try {
      const { email, otp, newPassword } = req.body;
      console.log("🔄 Bắt đầu đặt lại mật khẩu cho:", email);

      // 1. Validation (Kiểm tra thông tin bắt buộc)
      if (!email || !otp || !newPassword) {
        await transaction.rollback();
        console.log(
          "❌ Thiếu thông tin đặt lại mật khẩu (email/otp/newPassword)"
        );
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp đầy đủ email, mã OTP và mật khẩu mới.",
        });
      }

      // 2. Password strength validation (Kiểm tra độ mạnh mật khẩu)
      const passwordErrors = [];
      if (newPassword.length < 8)
        passwordErrors.push("Mật khẩu phải có ít nhất 8 ký tự.");
      if (!/[A-Z]/.test(newPassword))
        passwordErrors.push("Phải có ít nhất một chữ cái viết hoa.");
      if (!/[a-z]/.test(newPassword))
        passwordErrors.push("Phải có ít nhất một chữ cái viết thường.");
      if (!/[0-9]/.test(newPassword))
        passwordErrors.push("Phải có ít nhất một chữ số.");
      if (!/[^A-Za-z0-9]/.test(newPassword))
        passwordErrors.push("Phải có ít nhất một ký tự đặc biệt.");

      if (passwordErrors.length > 0) {
        await transaction.rollback();
        console.log("❌ Mật khẩu mới yếu hoặc không đáp ứng yêu cầu");
        return res.status(400).json({
          success: false,
          message: "Mật khẩu mới không đủ mạnh hoặc không hợp lệ.",
          errors: passwordErrors,
        });
      }

      // 3. Find User (Tìm người dùng)
      // Kiểm tra xem user có tồn tại và đang active không
      const user = await User.findOne({
        where: { email, status: "active" },
        transaction,
      });
      if (!user) {
        await transaction.rollback();
        console.log(`❌ Người dùng không tồn tại hoặc đã bị khóa: ${email}`);
        // Trả về thông báo chung chung để tránh rò rỉ thông tin
        return res.status(404).json({
          success: false,
          message: "Thông tin người dùng không hợp lệ.",
        });
      }

      // 4. Verify OTP (Kiểm tra OTP)
      // Gọi hàm service thuần túy để kiểm tra OTP trong transaction
      const isValidOtp = await verifyOtpService(
        {
          email,
          code: otp, // Thay otp thành code để khớp với tên biến trong service
          type: "reset_password",
        },
        transaction
      );

      if (!isValidOtp) {
        await transaction.rollback();
        console.log(`❌ OTP không hợp lệ hoặc đã hết hạn cho: ${email}`);
        return res.status(401).json({
          success: false,
          message: "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.",
        });
      }

      // 5. Hash new password (Mã hóa mật khẩu mới)
      console.log("🔐 Đang hash mật khẩu mới...");
      const hashedNewPassword = await bcrypt.hash(
        newPassword,
        HASH_SALT_ROUNDS
      );

      // 6. Update password (Cập nhật mật khẩu)
      user.password = hashedNewPassword;
      await user.save({ transaction });
      console.log("✅ Mật khẩu đã được cập nhật.");

      // 7. Invalidate OTP (Vô hiệu hóa OTP đã sử dụng)
      // Gọi hàm service để xóa OTP đã dùng thành công trong transaction
      await invalidateOtpService(
        { email, type: "reset_password" },
        transaction
      );
      console.log("✅ OTP đã được vô hiệu hóa.");

      // 8. Commit Transaction (Hoàn tất giao dịch)
      await transaction.commit();
      console.log(`✅ Đặt lại mật khẩu thành công cho: ${email}`);

      // Gửi phản hồi thành công
      return res.json({
        success: true,
        message:
          "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.",
      });
    } catch (error) {
      // Rollback nếu có bất kỳ lỗi nào xảy ra
      await transaction.rollback();
      console.error("❌ Lỗi hệ thống khi đặt lại mật khẩu:", error.message);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi đặt lại mật khẩu. Vui lòng thử lại sau.",
      });
    }
  }
  // =========================================================
  // 🔹 QUÊN MẬT KHẨU (ĐÃ THÊM LOG)
  // =========================================================
  async forgotPassword(req, res) {
    try {
      console.log("📧 Bắt đầu xử lý quên mật khẩu...");
      const { email } = req.body;

      if (!email) {
        console.log("❌ Thiếu email quên mật khẩu");
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp email.",
        });
      }

      const user = await User.findOne({ where: { email, status: "active" } });
      if (!user) {
        console.log("⚠️  Email không tồn tại (trả về thông báo an toàn)");
        return res.json({
          success: true,
          message: "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.",
        });
      }

      console.log("✅ Gửi OTP quên mật khẩu cho:", email);
      req.body.type = "reset_password";
      return sendOtp(req, res);
    } catch (error) {
      console.error("❌ Lỗi quên mật khẩu:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi xử lý yêu cầu quên mật khẩu.",
      });
    }
  }
  // =========================================================
  // 🔹 ĐĂNG XUẤT
  // =========================================================
  async logout(req, res) {
    try {
      // Clear refresh token cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "strict",
      });

      console.log(`[AUTH] User logged out: ${req.user?.email || "Unknown"}`);

      return res.json({
        success: true,
        message: "Đăng xuất thành công!",
      });
    } catch (error) {
      console.error("[AUTH] Error in logout:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi đăng xuất.",
      });
    }
  }

  // =========================================================
  // 🔹 ĐỔI MẬT KHẨU (YÊU CẦU MẬT KHẨU CŨ & AUTH TOKEN)
  // =========================================================
  changePassword = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { currentPassword, newPassword } = req.body; // Lấy thông tin người dùng từ Access Token (được thêm bởi authMiddleware)
      const userId = req.user.id;
      const userEmail = req.user.email;

      console.log(
        `🔄 Bắt đầu đổi mật khẩu cho user ID: ${userId}, Email: ${userEmail}`
      ); // 1. Validation

      if (!currentPassword || !newPassword) {
        await transaction.rollback();
        console.log("❌ Thiếu mật khẩu cũ hoặc mật khẩu mới");
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.",
        });
      } // 2. Password strength validation cho mật khẩu mới // Lỗi đã được khắc phục tại đây

      const passwordErrors = this.validatePassword(newPassword);
      if (passwordErrors.length > 0) {
        await transaction.rollback();
        console.log("❌ Mật khẩu mới yếu:", passwordErrors);
        return res.status(400).json({
          success: false,
          message: "Mật khẩu mới không đủ mạnh.",
          errors: passwordErrors,
        });
      } // 3. Find User (Tìm người dùng trong DB)

      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        // Điều này hiếm khi xảy ra nếu authMiddleware hoạt động đúng
        await transaction.rollback();
        console.log(`❌ Không tìm thấy User trong DB cho ID: ${userId}`);
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại.",
        });
      } // 4. Verify current password (Kiểm tra mật khẩu cũ)

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        await transaction.rollback();
        console.log("❌ Sai mật khẩu hiện tại");
        return res.status(401).json({
          success: false,
          message: "Mật khẩu hiện tại không đúng.",
        });
      } // 5. Kiểm tra mật khẩu mới và mật khẩu cũ có trùng nhau không

      if (currentPassword === newPassword) {
        await transaction.rollback();
        console.log("❌ Mật khẩu mới trùng với mật khẩu cũ");
        return res.status(400).json({
          success: false,
          message: "Mật khẩu mới không được trùng với mật khẩu hiện tại.",
        });
      } // 6. Hash new password (Mã hóa mật khẩu mới)

      console.log("🔐 Đang hash mật khẩu mới...");
      const hashedNewPassword = await bcrypt.hash(
        newPassword,
        HASH_SALT_ROUNDS
      ); // 7. Update password (Cập nhật mật khẩu)

      user.password = hashedNewPassword;
      await user.save({ transaction }); // 8. Commit Transaction

      await transaction.commit();
      console.log(`✅ Đổi mật khẩu thành công cho: ${userEmail}`); // Gửi phản hồi thành công

      return res.json({
        success: true,
        message:
          "Đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới cho lần đăng nhập tiếp theo.",
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi hệ thống khi đổi mật khẩu:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi đổi mật khẩu.",
      });
    }
  };
  // =========================================================
  // 🔹 ADMIN: GET ALL USERS (CHUẨN VỚI MODEL)
  // =========================================================
  async getAllUsers(req, res) {
    try {
      console.log("👑 Admin đang lấy danh sách users...");

      const {
        search,
        page = 1,
        limit = 10,
        role,
        status,
        sortBy = "created_at",
        sortOrder = "DESC",
      } = req.query;

      const offset = (page - 1) * limit;

      // 🎯 Xây dựng điều kiện WHERE
      const where = {};

      if (search) {
        where[Op.or] = [
          { email: { [Op.like]: `%${search}%` } },
          { name: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ];
      }

      if (role) {
        where.role = role;
      }

      if (status) {
        where.status = status;
      }

      // 🎯 Xác định trường sắp xếp (bảo vệ SQL injection)
      const allowedSortFields = [
        "created_at",
        "updated_at",
        "name",
        "email",
        "role",
        "status",
      ];
      const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : "created_at";
      const orderDirection = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

      console.log(
        `📊 Query: search=${search}, role=${role}, page=${page}, limit=${limit}`
      );

      const { count, rows: users } = await User.findAndCountAll({
        where,
        attributes: {
          exclude: ["password"], // ❌ Ẩn password
        },
        order: [[sortField, orderDirection]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      console.log(`✅ Tìm thấy ${count} users, trả về ${users.length} users`);

      return res.json({
        success: true,
        message: `Lấy danh sách users thành công. Tổng: ${count} users`,
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalUsers: count,
            usersPerPage: parseInt(limit),
            hasNext: page < Math.ceil(count / limit),
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("❌ [ADMIN] Lỗi khi lấy danh sách users:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách người dùng.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // =========================================================
  // 🔹 REFRESH TOKEN (ĐÃ THÊM LOG)
  // =========================================================
  async refreshToken(req, res) {
    try {
      console.log("🔄 Bắt đầu làm mới token...");

      // 1. Lấy refresh token từ cookie hoặc body
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!refreshToken) {
        console.log("❌ Không tìm thấy refresh token");
        return res.status(401).json({
          success: false,
          message: "Không tìm thấy refresh token. Vui lòng đăng nhập lại.",
          code: "MISSING_REFRESH_TOKEN",
        });
      }

      console.log("🔍 Đang xác thực refresh token...");

      // 2. Xác thực refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

      if (decoded.type !== "refresh") {
        console.log("❌ Token không phải loại refresh");
        return res.status(401).json({
          success: false,
          message: "Token không hợp lệ.",
          code: "INVALID_TOKEN_TYPE",
        });
      }

      let user = null;
      let isHardcodedAdmin = false;

      // 3. Kiểm tra admin cứng hoặc user thường
      if (decoded.id === "admin_initial") {
        console.log("👑 Phát hiện admin cứng trong refresh token");
        isHardcodedAdmin = true;
        user = {
          [USER_FIELDS.ID]: "admin_initial",
          [USER_FIELDS.NAME]: "Nguyen Dat Admin",
          [USER_FIELDS.EMAIL]: process.env.HARDCODED_ADMIN_EMAIL,
          [USER_FIELDS.ROLE]: "admin",
          [USER_FIELDS.STATUS]: "active",
          [USER_FIELDS.EMAIL_VERIFIED]: true,
        };
      } else {
        // 4. Tìm user trong database
        user = await User.findByPk(decoded.id);
        if (!user) {
          console.log("❌ Không tìm thấy user với ID:", decoded.id);
          return res.status(401).json({
            success: false,
            message: "Người dùng không tồn tại.",
            code: "USER_NOT_FOUND",
          });
        }

        // 5. Kiểm tra trạng thái user
        if (user.status !== "active") {
          console.log(
            `❌ User ${user.email} không active (status: ${user.status})`
          );
          return res.status(403).json({
            success: false,
            message: "Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa.",
            code: "ACCOUNT_INACTIVE",
          });
        }
      }

      // 6. Tạo access token mới với đầy đủ thông tin
      const tokenPayload = isHardcodedAdmin
        ? user
        : {
            [USER_FIELDS.ID]: user.id,
            [USER_FIELDS.ROLE]: user.role,
            [USER_FIELDS.EMAIL]: user.email,
            [USER_FIELDS.STATUS]: user.status,
            [USER_FIELDS.EMAIL_VERIFIED]: user.email_verified,
            [USER_FIELDS.NAME]: user.name,
            [USER_FIELDS.PHONE]: user.phone,
            [USER_FIELDS.ADDRESS]: user.address,
            [USER_FIELDS.AVATAR]: user.avatar,
          };

      const newAccessToken = jwt.sign(tokenPayload, JWT_ACCESS_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
        issuer: "sweetshop-api",
        audience: "sweetshop-client",
      });

      // 7. Tạo refresh token mới (optional - rotation)
      const newRefreshToken = jwt.sign(
        {
          id: isHardcodedAdmin ? "admin_initial" : user.id,
          type: "refresh",
        },
        JWT_REFRESH_SECRET,
        {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
          issuer: "sweetshop-api",
          audience: "sweetshop-client",
        }
      );

      // 8. Cập nhật refresh token trong cookie
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      console.log(`✅ Làm mới token thành công cho: ${user.email}`);

      return res.json({
        success: true,
        message: "Làm mới token thành công!",
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken, // Trả về nếu client cần
          expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
          user: isHardcodedAdmin
            ? user
            : {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                avatar: user.avatar,
                phone: user.phone,
                address: user.address,
                status: user.status,
              },
        },
      });
    } catch (error) {
      console.error("❌ Lỗi làm mới token:", error.message);

      // Xóa cookie nếu token không hợp lệ
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "strict",
      });

      // Xử lý các loại lỗi cụ thể
      if (error.name === "TokenExpiredError") {
        console.log("❌ Refresh token đã hết hạn");
        return res.status(401).json({
          success: false,
          message: "Refresh token đã hết hạn. Vui lòng đăng nhập lại.",
          code: "REFRESH_TOKEN_EXPIRED",
        });
      }

      if (error.name === "JsonWebTokenError") {
        console.log("❌ Refresh token không hợp lệ");
        return res.status(401).json({
          success: false,
          message: "Refresh token không hợp lệ.",
          code: "INVALID_REFRESH_TOKEN",
        });
      }

      // Lỗi server
      console.error("❌ Lỗi server khi làm mới token:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi làm mới token.",
        code: "REFRESH_TOKEN_SERVER_ERROR",
      });
    }
  }
  // =========================================================
  // 🔹 ADMIN: CREATE
  // =========================================================
  async createUser(req, res) {
    try {
      const { email, password, role } = req.body;

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        console.warn(
          `[ADMIN] User creation failed: Email ${email} already exists.`
        );
        return res.status(400).json({ message: "Email đã tồn tại" });
      }

      const hashed = await bcrypt.hash(password, HASH_SALT_ROUNDS);

      const user = await User.create({
        email,
        password: hashed,
        role,
      });

      console.log(`[ADMIN] User created: ${email}, Role: ${role}`);
      return res.status(201).json(user);
    } catch (err) {
      console.error("[ADMIN] Error in createUser:", err);
      return res
        .status(500)
        .json({ message: "Lỗi hệ thống khi tạo người dùng." });
    }
  }

  // =========================================================
  // 🔹 ADMIN: LẤY 1 USER
  // =========================================================
  async getUserById(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy user" });
      }

      return res.json(user);
    } catch (err) {
      console.error("[ADMIN] Error in getUserById:", err);
      return res
        .status(500)
        .json({ message: "Lỗi hệ thống khi lấy thông tin người dùng." });
    }
  }
  // =========================================================
  // 🔹 ADMIN: STATS
  // =========================================================
  async getAdminStats(req, res) {
    try {
      const totalUsers = await User.count();
      const totalAdmins = await User.count({ where: { role: "admin" } });
      const totalNormalUsers = totalUsers - totalAdmins;

      return res.json({
        totalUsers,
        totalAdmins,
        totalNormalUsers,
      });
    } catch (err) {
      console.error("[ADMIN] Error in getAdminStats:", err);
      return res
        .status(500)
        .json({ message: "Lỗi hệ thống khi lấy thống kê." });
    }
  }
  // src/controllers/auth.controller.js (trong AuthController class)

  // =========================================================
  // 🔹 ADMIN: CẤM/BỎ CẤM USER (BAN/UNBAN) - Sử dụng ENUM: active, inactive, deleted
  // =========================================================
  // src/controllers/auth.controller.js (trong AuthController class)

  // =========================================================
  // 🔹 ADMIN: CẤM/BỎ CẤM USER (BAN/UNBAN) - Đồng bộ với ENUM: active, inactive
  // =========================================================
  async banUser(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { userId } = req.params;
      // status: "active" (bỏ cấm) hoặc "inactive" (cấm)
      const { status } = req.body;
      const adminId = req.user.id;

      // 1. Validation
      if (!userId || !status) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin userId hoặc status.",
        });
      }

      // 2. Kiểm tra status hợp lệ VÀ ĐỒNG BỘ với ENUM
      // Chỉ chấp nhận 'active' (bỏ cấm) hoặc 'inactive' (cấm)
      const validStatuses = ["active", "inactive"];
      if (!validStatuses.includes(status)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message:
            "Trạng thái không hợp lệ. Chỉ chấp nhận: active (bỏ cấm), inactive (cấm).",
        });
      }

      // 3. Tìm user
      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng.",
        });
      }

      // Bổ sung kiểm tra: Không cho phép thay đổi trạng thái "deleted"
      if (user.status === "deleted") {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message:
            "Không thể thay đổi trạng thái của tài khoản đã bị xóa (deleted).",
        });
      }

      // 4. Không cho phép tự thay đổi trạng thái của chính mình
      if (parseInt(userId) === parseInt(adminId)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Bạn không thể thay đổi trạng thái của chính mình.",
        });
      }

      // 5. Không cho phép cấm/bỏ cấm admin khác (chỉ super-admin mới có quyền này)
      if (user.role === "admin" && req.user.role !== "super_admin") {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message:
            "Bạn không có quyền thay đổi trạng thái của quản trị viên khác.",
        });
      }

      // 6. Lưu trạng thái cũ để log
      const oldStatus = user.status;
      // Định nghĩa hành động dựa trên giá trị status gửi đến
      const action = status === "inactive" ? "cấm" : "bỏ cấm";

      // Ngăn chặn hành động thừa (Ví dụ: Cấm tài khoản đã inactive, hoặc bỏ cấm tài khoản đã active)
      if (oldStatus === status) {
        await transaction.rollback();
        const currentFriendlyStatus =
          oldStatus === "inactive" ? "đã bị cấm" : "đang hoạt động";
        return res.status(400).json({
          success: false,
          message: `Người dùng này đã ${currentFriendlyStatus}. Không cần thực hiện hành động ${action}.`,
        });
      }

      // 7. Cập nhật trạng thái
      user.status = status; // SỬ DỤNG TRỰC TIẾP GIÁ TRỊ TỪ REQUEST (inactive/active)
      await user.save({ transaction });

      // 8. Commit transaction
      await transaction.commit();

      console.log(
        `✅ Admin ${adminId} đã ${action} tài khoản ${user.email} (ID: ${userId}). Trạng thái mới: ${status}`
      );

      return res.json({
        success: true,
        message: `Đã ${action} tài khoản thành công. Trạng thái mới: ${status}.`,
        data: {
          userId: user.id,
          email: user.email,
          oldStatus,
          newStatus: status,
          action,
          updatedBy: adminId,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi thay đổi trạng thái user:", error);

      // Lỗi ENUM sẽ được bắt ở đây nếu có vấn đề gì khác
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi thay đổi trạng thái người dùng.",
      });
    }
  }
  validatePassword(password) {
    const errors = [];
    if (!password || password.length < 8)
      errors.push("Mật khẩu phải có ít nhất 8 ký tự");
    if (!/[A-Z]/.test(password))
      errors.push("Phải có ít nhất một chữ cái viết hoa");
    if (!/[a-z]/.test(password))
      errors.push("Phải có ít nhất một chữ cái viết thường");
    if (!/[0-9]/.test(password)) errors.push("Phải có ít nhất một chữ số");
    if (!/[^A-Za-z0-9]/.test(password))
      errors.push("Phải có ít nhất một ký tự đặc biệt");
    return errors;
  }
}

export default new AuthController();
