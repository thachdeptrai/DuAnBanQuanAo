import bcrypt from "bcrypt";
import models from "../model/init.js"; // Lấy toàn bộ đối tượng models

const { User, Order, Cart, Wishlist, sequelize } = models;

// ============================================================
// ✨ Helper functions
// ============================================================

// Helper kiểm tra password mạnh
function isStrongPassword(password) {
  const errors = [];
  if (!password || password.length === 0) {
    errors.push("Mật khẩu không được để trống");
    return errors;
  }
  if (password.length < 8) errors.push("Ít nhất 8 ký tự");
  if (!/[A-Z]/.test(password)) errors.push("Phải có chữ cái viết hoa");
  if (!/[a-z]/.test(password)) errors.push("Phải có chữ cái viết thường");
  if (!/[0-9]/.test(password)) errors.push("Phải có số");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("Phải có ký tự đặc biệt");
  return errors;
}

// Helper kiểm tra dữ liệu profile cập nhật
function validateUserProfile(data) {
  const errors = {};
  const { name, phone, address, avatar } = data;

  if (
    name !== undefined &&
    (typeof name !== "string" || name.length < 2 || name.length > 100)
  ) {
    errors.name = "Tên phải là chuỗi từ 2 đến 100 ký tự.";
  }

  if (
    phone !== undefined &&
    phone !== null &&
    phone.length > 0 &&
    !/^\d{10,12}$/.test(phone)
  ) {
    errors.phone = "Số điện thoại không hợp lệ (10-12 chữ số).";
  }

  if (
    address !== undefined &&
    address !== null &&
    address.length > 0 &&
    typeof address !== "string"
  ) {
    errors.address = "Địa chỉ phải là một chuỗi văn bản.";
  }

  // Giả định avatar là một URL
  if (
    avatar !== undefined &&
    avatar !== null &&
    avatar.length > 0 &&
    !/^https?:\/\/.+/.test(avatar)
  ) {
    errors.avatar = "Avatar phải là một đường dẫn URL hợp lệ.";
  }

  return errors;
}

const UserController = {
  // ============================================================
  // 🔹 Lấy profile người dùng
  // ============================================================
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      // Xử lý Admin mặc định (giả định)
      if (userId === "admin_initial") {
        return res.json({
          data: {
            id: "admin_initial",
            name: "Nguyen Dat Admin",
            email: "nguyentdat004@gmail.com",
            role: "admin",
            avatar: null,
            phone: null,
            address: null,
            created_at: new Date(),
          },
        });
      }

      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        // Lỗi này hiếm xảy ra nếu middleware hoạt động đúng, nhưng vẫn nên có.
        console.warn(
          `[getProfile] User ID ${userId} not found after authentication.`
        );
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      }

      res.json({ data: user });
    } catch (error) {
      console.error(`[getProfile] Lỗi Server:`, error.message, error.stack);
      res
        .status(500)
        .json({ message: "Lỗi Server nội bộ. Vui lòng thử lại sau." });
    }
  },

  // ============================================================
  // 🔹 Cập nhật profile
  // ============================================================
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;

      if (userId === "admin_initial") {
        console.warn(
          `[updateProfile] Cấm cập nhật profile cho admin mặc định: ${userId}`
        );
        return res.status(403).json({
          message: "Admin mặc định không thể cập nhật profile.",
        });
      }

      // CHỈ cho phép cập nhật các trường profile và email
      const { name, phone, address, avatar, email } = req.body;
      const updateData = {};

      // Lọc và chấp nhận các trường Profile
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone === "" ? null : phone;
      if (address !== undefined)
        updateData.address = address === "" ? null : address;
      if (avatar !== undefined)
        updateData.avatar = avatar === "" ? null : avatar;

      // 🛠️ SỬA LỖI: THAY THẾ validateProfileFields BẰNG VALIDATION ĐƠN GIẢN
      const profileErrors = {};

      // Validate đơn giản
      if (
        updateData.name &&
        (typeof updateData.name !== "string" ||
          updateData.name.trim().length === 0)
      ) {
        profileErrors.name = "Tên không được để trống";
      }
      if (updateData.phone && typeof updateData.phone !== "string") {
        profileErrors.phone = "Số điện thoại không hợp lệ";
      }
      if (updateData.address && typeof updateData.address !== "string") {
        profileErrors.address = "Địa chỉ không hợp lệ";
      }
      if (updateData.avatar && typeof updateData.avatar !== "string") {
        profileErrors.avatar = "Avatar URL không hợp lệ";
      }

      if (Object.keys(profileErrors).length > 0) {
        console.warn(
          `[updateProfile] Dữ liệu profile không hợp lệ từ user: ${userId}`,
          profileErrors
        );
        return res.status(400).json({
          message: "Dữ liệu cập nhật profile không hợp lệ.",
          errors: profileErrors,
        });
      }

      // ... PHẦN CÒN LẠI GIỮ NGUYÊN ...
      // Bắt đầu xử lý Email riêng biệt
      if (email !== undefined) {
        // 1. Kiểm tra định dạng Email
        if (typeof email !== "string" || !/\S+@\S+\.\S+/.test(email)) {
          return res.status(400).json({
            message: "Email không hợp lệ.",
            errors: { email: "Email phải đúng định dạng." },
          });
        }

        // 2. Kiểm tra trùng lặp email (Loại trừ ID của user hiện tại)
        const existingUser = await User.findOne({
          where: {
            email: email,
            id: { [models.Sequelize.Op.ne]: userId },
          },
        });

        if (existingUser) {
          console.warn(
            `[updateProfile] User ${userId} cố gắng cập nhật email trùng: ${email}`
          );
          return res.status(409).json({
            message: "Email này đã được sử dụng bởi người dùng khác.",
            errors: { email: "Email đã tồn tại." },
          });
        }

        // 3. Kiểm tra trùng email với Admin mặc định
        if (email === "nguyentdat004@gmail.com") {
          console.warn(
            `[updateProfile] User ${userId} cố gắng cập nhật email trùng Admin: ${email}`
          );
          return res.status(409).json({
            message: "Email này đã được sử dụng (System reserved).",
            errors: { email: "Email đã tồn tại." },
          });
        }

        updateData.email = email;
      }

      // Kiểm tra xem có dữ liệu để cập nhật không
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          message: "Không có dữ liệu hợp lệ nào được gửi đi để cập nhật.",
        });
      }

      const [affectedRows] = await User.update(updateData, {
        where: { id: userId },
      });

      if (affectedRows === 0) {
        console.warn(
          `[updateProfile] Cập nhật không thành công. User ID ${userId} có thể không tồn tại.`
        );
        return res
          .status(404)
          .json({ message: "Không tìm thấy người dùng để cập nhật." });
      }

      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      res.json({ message: "Cập nhật profile thành công", data: updatedUser });
    } catch (error) {
      // Xử lý lỗi trùng lặp do ràng buộc UNIQUE của database
      if (
        error.name === "SequelizeUniqueConstraintError" &&
        error.errors[0].path === "email"
      ) {
        return res.status(409).json({
          message: "Email này đã được sử dụng bởi người dùng khác.",
          errors: { email: "Email đã tồn tại." },
        });
      }

      console.error(`[updateProfile] Lỗi Server:`, error.message, error.stack);
      res
        .status(500)
        .json({ message: "Lỗi Server nội bộ. Vui lòng thử lại sau." });
    }
  },
  // ============================================================
  // 🔹 Đổi mật khẩu
  // ============================================================
  async changePassword(req, res) {
    try {
      const userId = req.user.id;

      if (userId === "admin_initial") {
        console.warn(
          `[changePassword] Cấm đổi mật khẩu cho admin mặc định: ${userId}`
        );
        return res.status(403).json({
          message: "Admin mặc định không thể đổi mật khẩu.",
        });
      }

      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        console.warn(`[changePassword] Thiếu dữ liệu từ user: ${userId}`);
        return res
          .status(400)
          .json({ message: "Vui lòng nhập mật khẩu cũ và mật khẩu mới." });
      }

      // 1. Kiểm tra độ mạnh của mật khẩu mới
      const errors = isStrongPassword(newPassword);
      if (errors.length > 0) {
        console.warn(
          `[changePassword] Mật khẩu mới không hợp lệ từ user: ${userId}`,
          errors
        );
        return res.status(400).json({
          message: "Mật khẩu mới không hợp lệ.",
          details: errors,
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        // Lỗi này hiếm nếu authMiddleware hoạt động đúng
        console.error(
          `[changePassword] Lỗi bảo mật: Không tìm thấy user ID ${userId} sau khi xác thực.`
        );
        return res.status(404).json({ message: "Không tìm thấy người dùng." });
      }

      // 2. So sánh mật khẩu cũ
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        console.warn(
          `[changePassword] Mật khẩu cũ không đúng cho user: ${userId}`
        );
        return res
          .status(401)
          .json({ message: "Mật khẩu cũ không chính xác." });
      }

      // 3. Kiểm tra trùng mật khẩu cũ và mới (optional nhưng nên có)
      if (oldPassword === newPassword) {
        return res
          .status(400)
          .json({ message: "Mật khẩu mới không được trùng với mật khẩu cũ." });
      }

      // 4. Mã hóa và Cập nhật
      const hashed = await bcrypt.hash(newPassword, 10);
      await User.update({ password: hashed }, { where: { id: userId } });

      // Log thành công
      console.info(
        `[changePassword] User ${userId} đã đổi mật khẩu thành công.`
      );

      res.json({ message: "Đổi mật khẩu thành công." });
    } catch (error) {
      console.error(`[changePassword] Lỗi Server:`, error.message, error.stack);
      res
        .status(500)
        .json({ message: "Lỗi Server nội bộ. Vui lòng thử lại sau." });
    }
  },

  // ============================================================
  // 🔹 Xóa tài khoản
  // ============================================================
  async deleteAccount(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const userId = req.user.id;

      // 🎯 1. Ngăn chặn xóa Admin mặc định
      if (userId === "admin_initial") {
        await transaction.rollback();
        console.warn(`[deleteAccount] Cấm xóa admin mặc định: ${userId}`);
        return res.status(403).json({
          message: "Không thể xóa admin mặc định.",
        });
      }

      const { password } = req.body;
      // 🎯 2. Kiểm tra mật khẩu xác nhận
      if (!password) {
        await transaction.rollback();
        console.warn(
          `[deleteAccount] Thiếu mật khẩu xác nhận từ user: ${userId}`
        );
        return res.status(400).json({
          message: "Vui lòng nhập mật khẩu để xác nhận xóa tài khoản.",
        });
      }

      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        await transaction.rollback();
        console.error(
          `[deleteAccount] Lỗi bảo mật: Không tìm thấy user ID ${userId} sau khi xác thực.`
        );
        return res.status(404).json({ message: "Không tìm thấy người dùng." });
      }

      // 🎯 3. So sánh mật khẩu xác nhận
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        await transaction.rollback();
        console.warn(
          `[deleteAccount] Mật khẩu xác nhận không đúng cho user: ${userId}`
        );
        return res.status(401).json({ message: "Mật khẩu không chính xác." });
      }

      // 🎯 4. SOFT DELETE (Đóng băng) và GIẢI PHÓNG EMAIL
      const originalEmail = user.email;

      // Đổi email thành chuỗi duy nhất để giải phóng email gốc (quan trọng nhất)
      user.email = `deleted_${userId}_${Date.now()}_${originalEmail}`;
      user.status = "deleted"; // Đặt trạng thái đóng băng
      user.deleted_at = new Date(); // Thêm thời gian xóa mềm

      await user.save({ transaction }); // Lưu thay đổi

      // 🎯 5. Xóa Refresh Token Cookie (Buộc đăng xuất ngay lập tức)
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "strict",
      });

      await transaction.commit();

      console.info(
        `[deleteAccount] User ${userId} (${originalEmail}) đã bị đóng băng. Email gốc đã được giải phóng.`
      );

      return res.json({
        message:
          "Xóa tài khoản thành công. Tài khoản cũ đã bị đóng băng, và email của bạn đã được giải phóng để đăng ký lại.",
      });
    } catch (error) {
      await transaction.rollback();
      console.error(`[deleteAccount] Lỗi Server:`, error.message, error.stack);

      return res
        .status(500)
        .json({ message: "Lỗi Server nội bộ. Vui lòng thử lại sau." });
    }
  },

  // ============================================================
  // 🔹 Thống kê user
  // ============================================================
  async getStatistics(req, res) {
    try {
      const userId = req.user.id;

      // Sử dụng Promise.all để tối ưu tốc độ truy vấn
      const [orderCount, cartCount, wishlistCount] = await Promise.all([
        Order.count({ where: { user_id: userId } }),
        Cart.count({ where: { user_id: userId } }),
        Wishlist.count({ where: { user_id: userId } }),
      ]);

      res.json({
        data: {
          orders: orderCount,
          cartItems: cartCount,
          wishlistItems: wishlistCount,
        },
      });
    } catch (error) {
      console.error(`[getStatistics] Lỗi Server:`, error.message, error.stack);
      res
        .status(500)
        .json({ message: "Lỗi Server nội bộ. Vui lòng thử lại sau." });
    }
  },
};

export default UserController;
