import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id=?", [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get top-selling products
router.get("/top/selling", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM products ORDER BY sales DESC LIMIT 10"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      old_price,
      image,
      category_id,
      rating,
      sales,
      stock,
      is_featured,
      is_new,
      is_sale,
    } = req.body;
    const [result] = await pool.query(
      `INSERT INTO products 
      (name, description, price, old_price, image, category_id, rating, sales, stock, is_featured, is_new, is_sale) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        price,
        old_price,
        image,
        category_id,
        rating,
        sales,
        stock,
        is_featured,
        is_new,
        is_sale,
      ]
    );
    res.json({ id: result.insertId, name, price });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product
router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      old_price,
      image,
      category_id,
      stock,
    } = req.body;
    await pool.query(
      `UPDATE products 
       SET name=?, description=?, price=?, old_price=?, image=?, category_id=?, stock=?, updated_at=NOW() 
       WHERE id=?`,
      [name, description, price, old_price, image, category_id, stock, req.params.id]
    );
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id=?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
