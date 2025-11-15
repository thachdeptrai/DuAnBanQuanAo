// src/config/db.js
import { Sequelize, QueryTypes } from "sequelize"; // Import thêm QueryTypes
import "dotenv/config";

const dbName = process.env.MYSQL_DATABASE;
const dbUser = process.env.MYSQL_USER;
const dbPassword = process.env.MYSQL_PASSWORD;
const dbHost = process.env.MYSQL_HOST || "localhost";

// 1. TẠO KẾT NỐI TẠM THỜI CHỈ ĐẾN MÁY CHỦ
// (Không chỉ định tên DB)
const sequelizeTemp = new Sequelize(
  "", // Bỏ trống tên DB
  dbUser,
  dbPassword,
  {
    host: dbHost,
    dialect: "mysql",
    logging: false,
  }
);

/**
 * Hàm kiểm tra và tạo database nếu chưa tồn tại
 */
async function createDatabaseIfNotExists() {
  try {
    // 1. Kiểm tra kết nối máy chủ
    await sequelizeTemp.authenticate();
    console.log("✅ Kết nối MySQL Server thành công!");

    // 2. Kiểm tra sự tồn tại của database
    const [results] = await sequelizeTemp.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${dbName}'`,
      { type: QueryTypes.SELECT }
    );

    if (results) {
      console.log(`✅ Database '${dbName}' đã tồn tại.`);
    } else {
      // 3. Nếu chưa tồn tại, tiến hành tạo database
      await sequelizeTemp.query(
        `CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`
      );
      console.log(`✨ Database '${dbName}' đã được tạo thành công.`);
    }
  } catch (error) {
    console.error("❌ Lỗi trong quá trình kiểm tra/tạo Database:", error);
    throw error; // Ngăn không cho chương trình tiếp tục nếu không tạo được DB
  } finally {
    // Đóng kết nối tạm thời
    await sequelizeTemp.close();
  }
}

// 4. CHẠY HÀM TẠO DATABASE
await createDatabaseIfNotExists();

// 5. TẠO INSTANCE KẾT NỐI CHÍNH THỨC VỚI DATABASE 'sweetshop'
const sequelize = new Sequelize(
  dbName, // Tên DB (Đã đảm bảo tồn tại)
  dbUser,
  dbPassword,
  {
    host: dbHost,
    dialect: "mysql",
    logging: false,
  }
);

// Kiểm tra kết nối cuối cùng (không bắt buộc, nhưng là bước an toàn)
try {
  await sequelize.authenticate();
  console.log("✅ Kết nối đến DB 'sweetshop' thành công!");
} catch (error) {
  console.error("❌ Không thể kết nối đến DB 'sweetshop':", error);
}

export default sequelize;
