import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get all orders
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM orders");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single order with items
router.get("/:id", async (req, res) => {
  try {
    const [order] = await pool.query("SELECT * FROM orders WHERE id=?", [
      req.params.id,
    ]);
    if (order.length === 0) return res.status(404).json({ error: "Not found" });

    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.image 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id=?`,
      [req.params.id]
    );

    res.json({ ...order[0], items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create order
router.post("/", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { user_id, shipping_address, payment_method, items } = req.body;

    await conn.beginTransaction();

    // Insert order
    const [result] = await conn.query(
      "INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?)",
      [
        user_id,
        items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        shipping_address,
        payment_method,
      ]
    );

    const orderId = result.insertId;

    // Insert order items
    for (const item of items) {
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    await conn.commit();
    res.json({ id: orderId, message: "Order created" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Update order status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query("UPDATE orders SET status=?, updated_at=NOW() WHERE id=?", [
      status,
      req.params.id,
    ]);
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete order
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM orders WHERE id=?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
