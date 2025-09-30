import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get cart by user
router.get("/:user_id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.quantity, p.name, p.price, p.image 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id=?`,
      [req.params.user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add to cart (using stored procedure)
router.post("/add", async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    await pool.query("CALL add_to_cart(?, ?, ?)", [user_id, product_id, quantity]);
    res.json({ message: "Added to cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove from cart
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM cart WHERE id=?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
