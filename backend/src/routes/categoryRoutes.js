import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single category by id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new category
router.post("/", async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const [result] = await pool.query(
      "INSERT INTO categories (name, description, image) VALUES (?, ?, ?)",
      [name, description, image]
    );
    res.json({ id: result.insertId, name, description, image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update category
router.put("/:id", async (req, res) => {
  try {
    const { name, description, image } = req.body;
    await pool.query(
      "UPDATE categories SET name=?, description=?, image=?, updated_at=NOW() WHERE id=?",
      [name, description, image, req.params.id]
    );
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete category
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM categories WHERE id=?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
