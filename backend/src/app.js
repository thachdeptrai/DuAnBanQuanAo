// src/app.js

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/user.router.js";
import otpRouter from "./routes/otp.router.js";

import sequelize from "./config/db.js";

const app = express();

// ================= DEBUG GLOBAL =================
app.use((req, res, next) => {
  console.log(
    `\n--- [GLOBAL DEBUG START] Request: ${req.method} ${req.url} ---`
  );
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("--- [GLOBAL DEBUG END] ---\n");
  next();
});
// =================================================

// ================== CORS CONFIG ==================
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
// =================================================

app.use(express.json());
app.use(cookieParser());

// ====================== ROUTES ======================
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/otp", otpRouter);

// Test API
app.get("/", (req, res) => res.json({ message: "API running" }));
// =====================================================

// ✅ Sync database
sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ All models synchronized successfully."))
  .catch((err) => console.error("❌ Error syncing models:", err));

export default app;
