// src/controllers/user.controller.js (hoặc user.controller.mjs)

import UserModel from "../model/user.model.js"; // Import Default, nhớ thêm .js
import bcrypt from "bcrypt"; // Import bcrypt

// =======================================================
// Lấy thông tin người dùng theo ID (dựa trên token)
// =======================================================
export const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    console.log(
      "Payload Token ID:",
      req.user ? req.user.id : "Không tìm thấy req.user"
    );
    console.log(`[USER-DEBUG] Find result: ${user ? "FOUND" : "NOT FOUND"}`); // Log 2

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Loại bỏ password và trả về dữ liệu chuẩn
    const { password, ...userData } = user;
    res.json({ data: userData });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// =======================================================
// Cập nhật thông tin người dùng
// =======================================================
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID từ token đã xác thực

    // Lấy các trường CẦN CẬP NHẬT từ body.
    const { name, phone, address, avatar } = req.body;

    // Xây dựng object dữ liệu chỉ chứa các trường được gửi (không phải undefined)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Nếu không có dữ liệu nào để cập nhật (body rỗng)
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "Không có trường dữ liệu nào được gửi để cập nhật.",
      });
    }

    // CHỈ truyền các trường đã được lọc vào hàm Model
    const success = await UserModel.updateUser(userId, updateData);
    if (!success) {
      // Trường hợp không có hàng nào bị ảnh hưởng (dữ liệu giống hệt)
      // Ta vẫn chấp nhận và tiếp tục lấy dữ liệu updatedUser.
      console.log(
        `[UPDATE-WARN] User ID ${userId}: No rows affected, data might be identical.`
      );
    }

    // Lấy thông tin người dùng đã cập nhật
    const updatedUser = await UserModel.findById(userId);
    // Loại bỏ password và trả về dữ liệu
    const { password, ...userData } = updatedUser;
    res.json({ message: "Cập nhật thành công", data: userData });
  } catch (error) {
    console.error("Lỗi cập nhật người dùng:", error);

    // Xử lý lỗi trùng lặp email (ER_DUP_ENTRY) - Giữ lại phòng trường hợp email được cập nhật
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Email này đã được sử dụng bởi tài khoản khác." });
    }

    // Xử lý lỗi database (ví dụ: Unknown column)
    if (error.code === "ER_BAD_FIELD_ERROR") {
      return res.status(500).json({
        message:
          "Lỗi cấu trúc cơ sở dữ liệu. Vui lòng kiểm tra các cột trong bảng users.",
        details: error.sqlMessage,
      });
    }

    res.status(500).json({ message: "Lỗi server" });
  }
};

// =======================================================
// Xóa người dùng (yêu cầu xác nhận mật khẩu)
// =======================================================
export const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập mật khẩu để xác nhận xóa tài khoản." });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      // Đây là trường hợp hiếm gặp vì token đã xác thực
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không chính xác." });
    }

    // Thực hiện xóa tài khoản
    const success = await UserModel.deleteUser(userId); // Giả định hàm Model chỉ cần userId

    if (!success) {
      return res
        .status(400)
        .json({ message: "Xóa tài khoản không thành công." });
    }

    // Thường thì sau khi xóa tài khoản, client cần được hướng dẫn xóa token
    res.json({
      message: "Tài khoản đã được xóa thành công. Vui lòng đăng nhập lại.",
    });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Sử dụng Named Export cho tất cả các hàm
// File route sẽ sử dụng Named Import: import { getUserInfo, updateUser, deleteUser } from '...'
