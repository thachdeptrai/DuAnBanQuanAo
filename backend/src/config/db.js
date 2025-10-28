// src/config/db.js (hoặc db.mjs)

import mysql from "mysql2/promise";
import "dotenv/config"; // 💡 CÁCH CHUẨN ĐỂ TẢI BIẾN MÔI TRƯỜNG TRONG ES MODULES

// 🚨 LƯU Ý: Không cần gọi require("dotenv").config() hoặc dotenv.config() nữa.

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Sử dụng export default để xuất pool
export default pool;
