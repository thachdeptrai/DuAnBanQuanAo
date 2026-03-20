import dotenv from "dotenv";
dotenv.config();

import sequelize from "./src/config/db.js";
// XÓA dòng import init.js từ đây vì đã import trong db.js

import app from "./src/app.js";

const PORT = process.env.PORT || 4000;

console.log("✅ Using database:", process.env.MYSQL_DATABASE);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
