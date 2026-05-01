import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import sequelize, { initializeDatabase } from "./src/config/db.js";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await initializeDatabase();

    // 🔥 FIX QUAN TRỌNG
    app.locals.sequelize = sequelize;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
