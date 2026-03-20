import { Sequelize, QueryTypes } from "sequelize";
import "dotenv/config";

const dbName = process.env.MYSQL_DATABASE;
const dbUser = process.env.MYSQL_USER;
const dbPassword = process.env.MYSQL_PASSWORD;
const dbHost = process.env.MYSQL_HOST || "localhost";
const dbPort = process.env.MYSQL_PORT || 3306;

// Tạo kết nối chính thức
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "mysql",
  logging: console.log,
  dialectOptions: {
    connectTimeout: 60000,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
});

// Hàm khởi tạo database hoàn chỉnh
async function initializeDatabase() {
  try {
    console.log("🔄 Đang khởi tạo database...");

    // 1. Tạo kết nối tạm để kiểm tra/tạo database
    const sequelizeTemp = new Sequelize("", dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: "mysql",
      logging: false,
    });

    console.log("🔄 Đang kết nối đến MySQL server...");
    await sequelizeTemp.authenticate();
    console.log("✅ Kết nối MySQL Server thành công!");

    // Kiểm tra database tồn tại
    const databases = await sequelizeTemp.query(
      `SHOW DATABASES LIKE '${dbName}'`,
      { type: QueryTypes.SELECT }
    );

    if (databases.length > 0) {
      console.log(`✅ Database '${dbName}' đã tồn tại.`);
    } else {
      console.log(`🔄 Database '${dbName}' chưa tồn tại, đang tạo...`);
      await sequelizeTemp.query(
        `CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log(`✨ Database '${dbName}' đã được tạo thành công.`);
    }

    await sequelizeTemp.close();

    // 2. Kết nối đến database chính
    console.log("🔄 Đang kết nối đến database...");
    await sequelize.authenticate();
    console.log("✅ Kết nối đến DB 'sweetshop' thành công!");

    // 3. Import và khởi tạo models
    console.log("🔄 Đang khởi tạo models và associations...");
    const models = await import("../model/init.js");
    console.log("✅ Models và associations đã được khởi tạo!");

    // 4. Đồng bộ hóa database
    console.log("🔄 Đang đồng bộ hóa database...");
    await sequelize.sync({
      force: false,
      alter: true,
    });
    console.log("✅ Đồng bộ hóa database thành công!");

    // 5. Hiển thị các bảng đã tạo
    const [tables] = await sequelize.query("SHOW TABLES");
    console.log("📊 Các bảng đã được tạo:");

    if (tables.length === 0) {
      console.log("   ❌ Không có bảng nào được tạo!");
    } else {
      tables.forEach((table, index) => {
        const tableName = table[`Tables_in_${dbName}`];
        console.log(`   ${index + 1}. ${tableName}`);
      });
    }

    return models.default;
  } catch (error) {
    console.error("❌ Lỗi khởi tạo database:", error);

    if (error.code === "MODULE_NOT_FOUND") {
      console.error("   📁 Không tìm thấy file model/init.js");
      console.error("   📍 Kiểm tra đường dẫn:", error.path);
    }

    throw error;
  }
}

// Export chỉ sequelize, không export models
export default sequelize;
export { initializeDatabase };
