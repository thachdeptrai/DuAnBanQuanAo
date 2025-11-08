// src/config/db.js
import { Sequelize } from "sequelize";
import "dotenv/config";

// Kết nối Sequelize tới MySQL
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE, // Tên DB
  process.env.MYSQL_USER, // User
  process.env.MYSQL_PASSWORD, // Mật khẩu
  {
    host: process.env.MYSQL_HOST || "localhost",
    dialect: "mysql",
    logging: false, // tắt log SQL
  }
);

// Kiểm tra kết nối
try {
  await sequelize.authenticate();
  console.log("✅ Kết nối MySQL thành công!");
} catch (error) {
  console.error("❌ Không thể kết nối MySQL:", error);
}

export default sequelize;
