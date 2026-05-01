import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Routes
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ================== MIDDLEWARES ==================
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

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

export default app;
