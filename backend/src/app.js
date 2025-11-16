// src/app.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/produc.router.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/user.router.js";
import otpRouter from "./routes/otp.router.js";
import brandRouter from "./routes/brand.router.js";
import categoryRoutes from "./routes/category.routes.js";
import attributeRouter from "./routes/attribute.router.js";
import attributeValueRoutes from "./routes/attribute_values.router.js";
import productVariantRoutes from "./routes/productVariant.routes.js";
import variantAttributeRoutes from "./routes/variantAttribute.routes.js";
import productMediaRoutes from "./routes/productMedia.routes.js";

// Sequelize
import sequelize from "./config/db.js";
import models from "./model/init.js";
import { setupAssociations } from "./model/associations.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ================== CORS ==================
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ================== DATABASE ==================
const initializeDatabase = async () => {
  try {
    console.log("🔄 Initializing database...");

    // associations dùng models từ init.js
    setupAssociations(models);

    await sequelize.authenticate();
    console.log("✅ Database connection established!");

    await sequelize.sync({ alter: true });
    console.log("✅ Database synchronized!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
};
console.log("JWT_ACCESS_SECRET:", process.env.JWT_ACCESS_SECRET);

// ================== ROUTES ==================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/otp", otpRouter);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/brands", brandRouter);
app.use("/api/categories", categoryRoutes);
app.use("/api/attributes", attributeRouter);
app.use("/api/attribute-values", attributeValueRoutes);
app.use("/api/variant-attributes", variantAttributeRoutes);
app.use("/api/product-media", productMediaRoutes);

app.use("/api/product-variants", productVariantRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("💥 Global Error:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// ================== SERVER ==================
const PORT = process.env.PORT || 3000;

export const startServer = async () => {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default app;
