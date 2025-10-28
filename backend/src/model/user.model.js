import pool from "../config/db.js";
const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async createUser({ name, email, password, phone, address, avatar }) {
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, phone, address, avatar) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, password, phone || null, address || null, avatar || null]
    );
    return result.insertId;
  },

  async updatePassword(id, newHashedPassword) {
    const [result] = await pool.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [newHashedPassword, id]
    );
    return result.affectedRows > 0;
  }, // Đã Tối ưu hóa: Xử lý NULL và chỉ cập nhật các trường được gửi đến

  /**
   * Cập nhật thông tin người dùng theo ID
   * @param {number} id ID người dùng
   * @param {object} updateData Dữ liệu cập nhật (chỉ chứa các trường hợp lệ)
   * @returns {boolean} True nếu có hàng nào bị ảnh hưởng
   */
  async updateUser(id, updateData) {
    const fields = [];
    const values = [];

    // Danh sách các trường được phép cập nhật
    // (Vẫn giữ email trong Model nhưng Controller đã chặn gửi nó)
    const allowedFields = ["name", "email", "phone", "address", "avatar"];
    const nullableFields = ["phone", "address", "avatar"]; // Các trường có thể là NULL

    for (const field of allowedFields) {
      // CHỈ xử lý các trường có trong updateData (khác undefined)
      if (updateData[field] !== undefined) {
        fields.push(`${field} = ?`);

        let valueToStore = updateData[field];

        // Nếu là trường có thể NULL VÀ giá trị là chuỗi rỗng ("")
        if (nullableFields.includes(field) && valueToStore === "") {
          valueToStore = null; // Chuyển chuỗi rỗng thành NULL cho database
        }

        values.push(valueToStore);
      }
    }

    // Nếu không có trường nào để cập nhật sau khi lọc
    if (fields.length === 0) {
      // Trả về false nếu không có gì để cập nhật.
      // (Controller sẽ xử lý lỗi 400 nếu object ban đầu rỗng)
      return false;
    }

    values.push(id); // Thêm ID vào cuối mảng values

    const [result] = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    // Trả về true nếu có hàng nào bị ảnh hưởng (cập nhật thành công)
    return result.affectedRows > 0;
  },
  async deleteUser(requesterId, targetId) {
    if (requesterId !== targetId) {
      return false;
    }

    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
      targetId,
    ]);
    return result.affectedRows > 0;
  },
};

export default UserModel;
