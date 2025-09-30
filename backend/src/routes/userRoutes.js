import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, email, name, phone, address, role, created_at FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single user
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id=?", [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register user
router.post("/register", async (req, res) => {
  try {
    const { email, password, full_name, phone, address } = req.body;
    const [result] = await pool.query(
      "INSERT INTO users (email, password, name, phone, address) VALUES (?, ?, ?, ?, ?)",
      [email, password, full_name, phone, address]
    );
    res.json({ id: result.insertId, email, full_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login (basic, chưa hash)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email=? AND password=?",
      [email, password]
    );
    if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const { full_name, phone, address, role } = req.body;
    await pool.query(
      "UPDATE users SET name=?, phone=?, address=?, role=?, updated_at=NOW() WHERE id=?",
      [full_name, phone, address, role, req.params.id]
    );
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id=?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
