import pool from "../config/db.js";
// PHẢI import QueryTypes từ 'sequelize' vì pool ở đây thực chất là instance Sequelize
import { QueryTypes } from "sequelize";

const UserModel = {
  // =======================================================
  // Tìm người dùng bằng Email
  // =======================================================
  async findByEmail(email) {
    const sql = "SELECT * FROM users WHERE email = ?";
    try {
      console.log(`[DB-DEBUG] Executing SQL: ${sql} with params:`, [email]);

      // QueryTypes.SELECT trả về trực tiếp mảng các bản ghi
      const rows = await pool.query(sql, {
        replacements: [email],
        type: QueryTypes.SELECT,
      });

      // ✅ rows đã là mảng các user, chỉ cần lấy rows[0]
      console.log(`[DB-DEBUG] Result rows:`, rows);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Lỗi Model.findByEmail:", error);
      throw error;
    }
  }, // Tìm người dùng bằng ID // =======================================================

  // =======================================================
  // Tìm người dùng bằng ID
  // =======================================================

  // =======================================================
  async findById(id) {
    // Chỉ chọn các cột cần thiết, bao gồm password để phục vụ việc kiểm tra mật khẩu
    const sql =
      "SELECT id, name, email, phone, address, avatar, role, password, created_at FROM users WHERE id = ?";
    try {
      // [SỬA ĐỔI QUAN TRỌNG NHẤT] Đặt tên biến là rows cho rõ ràng
      const rows = await pool.query(sql, {
        replacements: [id],
        type: QueryTypes.SELECT, // Kết quả là MẢNG các bản ghi: [ {id: 3, ...} ]
      }); // ✅ Trả về đối tượng ĐẦU TIÊN của mảng, hoặc null nếu mảng rỗng

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Lỗi Model.findById:", error);
      throw error;
    }
  },
  // =======================================================
  // Tạo người dùng mới
  // =======================================================

  async createUser({ name, email, password, phone, address, avatar }) {
    const sql =
      "INSERT INTO users (name, email, password, phone, address, avatar) VALUES (?, ?, ?, ?, ?, ?)";
    // Đặt phone, address, avatar là NULL nếu chúng không được cung cấp (undefined hoặc rỗng)

    const values = [
      name,
      email,
      password,
      phone || null,
      address || null,
      avatar || null,
    ];

    try {
      // Đối với INSERT, Sequelize trả về [insertId, affectedRows] cho MySQL. result là insertId.
      const [result] = await pool.query(sql, {
        replacements: values,
        type: QueryTypes.INSERT,
      });
      return result;
    } catch (error) {
      console.error("Lỗi Model.createUser:", error);
      throw error;
    }
  },
  // =======================================================
  // Cập nhật mật khẩu
  // =======================================================

  async updatePassword(id, newHashedPassword) {
    const sql = "UPDATE users SET password = ? WHERE id = ?";
    try {
      // Đối với UPDATE, Sequelize trả về [affectedRows, metadata]. affectedRows là result.
      const [affectedRows] = await pool.query(sql, {
        replacements: [newHashedPassword, id],
        type: QueryTypes.UPDATE,
      });
      // FIX: Chỉ cần kiểm tra affectedRows > 0
      return affectedRows > 0;
    } catch (error) {
      console.error("Lỗi Model.updatePassword:", error);
      throw error;
    }
  },
  // =======================================================
  // Cập nhật thông tin người dùng
  // =======================================================
  /**
   * Cập nhật thông tin người dùng theo ID
   * @param {number} id ID người dùng
   * @param {object} updateData Dữ liệu cập nhật (chỉ chứa các trường hợp lệ)
   * @returns {boolean} True nếu có hàng nào bị ảnh hưởng
   */
  async updateUser(id, updateData) {
    const fields = [];
    const values = []; // Danh sách các trường được phép cập nhật

    const allowedFields = ["name", "phone", "address", "avatar"]; // Giả định email không được phép cập nhật qua API này
    const nullableFields = ["phone", "address", "avatar"]; // Các trường có thể là NULL

    for (const field of allowedFields) {
      // CHỈ xử lý các trường có trong updateData (khác undefined)
      if (updateData[field] !== undefined) {
        fields.push(`${field} = ?`);

        let valueToStore = updateData[field]; // Nếu là trường có thể NULL VÀ giá trị là chuỗi rỗng ("")

        if (nullableFields.includes(field) && valueToStore === "") {
          valueToStore = null; // Chuyển chuỗi rỗng thành NULL cho database
        }

        values.push(valueToStore);
      }
    } // Nếu không có trường nào để cập nhật sau khi lọc

    if (fields.length === 0) {
      return false;
    }

    values.push(id); // Thêm ID vào cuối mảng values cho điều kiện WHERE

    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;

    try {
      // Đối với UPDATE, Sequelize trả về [affectedRows, metadata]. affectedRows là result.
      const [affectedRows] = await pool.query(sql, {
        replacements: values,
        type: QueryTypes.UPDATE,
      });
      // FIX: Chỉ cần kiểm tra affectedRows > 0
      return affectedRows > 0;
    } catch (error) {
      console.error("Lỗi Model.updateUser:", error);
      throw error;
    }
  },
  // =======================================================
  // Xóa người dùng (Chỉ dựa vào ID)
  // =======================================================

  async deleteUser(id) {
    const sql = "DELETE FROM users WHERE id = ?";

    try {
      // Đối với DELETE, Sequelize trả về [affectedRows, metadata]. affectedRows là result.
      const [affectedRows] = await pool.query(sql, {
        replacements: [id],
        type: QueryTypes.DELETE,
      });
      // FIX: Chỉ cần kiểm tra affectedRows > 0
      return affectedRows > 0;
    } catch (error) {
      console.error("Lỗi Model.deleteUser:", error);
      throw error;
    }
  },
};

export default UserModel;
