import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ===== LOAD ENV =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// ===== CONFIG =====
const dbName = process.env.MYSQL_DATABASE || "sweetshop";
const dbUser = process.env.MYSQL_USER || "root";
const dbPassword = process.env.MYSQL_PASSWORD || "";
const dbHost = process.env.MYSQL_HOST || "127.0.0.1";
const dbPort = parseInt(process.env.MYSQL_PORT) || 3306;

console.log("-----------------------------------------");
console.log(`🔌 MySQL: ${dbUser}@${dbHost}:${dbPort}`);
console.log(`📂 Database: ${dbName}`);
console.log("-----------------------------------------");

// ===== MAIN SEQUELIZE =====
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "mysql",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
});

// ===== INIT DATABASE =====
async function initializeDatabase() {
  let sequelizeTemp;

  try {
    console.log("🔄 B1: Check MySQL connection...");

    // connect không chọn DB
    sequelizeTemp = new Sequelize("", dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: "mysql",
      logging: false,
    });

    await sequelizeTemp.authenticate();
    console.log("✅ MySQL connected!");

    // check database tồn tại
    const [dbs] = await sequelizeTemp.query(`SHOW DATABASES LIKE '${dbName}'`);

    if (dbs.length === 0) {
      console.log(`🔄 Creating database '${dbName}'...`);
      await sequelizeTemp.query(
        `CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
      console.log("✅ Database created!");
    } else {
      console.log("✅ Database exists!");
    }

    await sequelizeTemp.close();

    // ===== CONNECT DB =====
    console.log("🔄 B2: Connect database...");
    await sequelize.authenticate();
    console.log("✅ Connected to DB!");

    // ===== LOAD MODELS =====
    console.log("🔄 B3: Loading models...");
    const { default: models } = await import("../model/init.js");
    console.log("✅ Models loaded!");

    // ===== SYNC DB =====
    console.log("🔄 B4: Sync database...");

    /**
     * ⚠️ DEV lần đầu:
     * dùng force: true để tạo bảng sạch
     * sau đó đổi lại sequelize.sync()
     */

    await sequelize.sync({ force: true });
    // sau này đổi thành:
    // await sequelize.sync();

    console.log("✅ Database synced!");

    return models;
  } catch (error) {
    if (sequelizeTemp) await sequelizeTemp.close();

    console.error("❌ INIT DB ERROR:");

    if (error.name === "SequelizeAccessDeniedError") {
      console.error("👉 Sai user/password MySQL");
    } else if (error.code === "ECONNREFUSED") {
      console.error("👉 MySQL chưa bật (Laragon/XAMPP)");
    } else {
      console.error("👉", error.message);
    }

    throw error;
  }
}

export default sequelize;
export { initializeDatabase };
