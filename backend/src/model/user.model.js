// src/model/user.model.js
const pool = require("../config/db");

const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0] || null;
  },

  // ✨ Hàm mới: Tìm người dùng bằng ID
  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    // Trả về đối tượng người dùng hoặc null nếu không tìm thấy
    return rows[0] || null;
  },

  async createUser({ name, email, password, role }) {
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, password, role]
    );
    return result.insertId;
  },

  // ✨ Hàm mới: Cập nhật mật khẩu người dùng
  async updatePassword(id, newHashedPassword) {
    const [result] = await pool.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [newHashedPassword, id]
    );
    // Trả về true nếu ít nhất 1 hàng bị ảnh hưởng (cập nhật thành công)
    return result.affectedRows > 0;
  },
};

module.exports = UserModel;
