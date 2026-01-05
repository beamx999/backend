const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const auth = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: การจัดการคำสั่งซื้อ
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: สั่งอาหาร
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_id
 *               - menu_id
 *               - quantity
 *             properties:
 *               restaurant_id:
 *                 type: integer
 *               menu_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: สั่งซื้อสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order_id:
 *                   type: integer
 *                 total:
 *                   type: number
 *       400:
 *         description: ข้อมูลไม่ครบหรือไม่ถูกต้อง
 *       401:
 *         description: Unauthorized
 */
router.post("/", auth, async (req, res) => {
  try {
    const { restaurant_id, menu_id, quantity } = req.body;

    if (!restaurant_id || !menu_id || !quantity) {
      return res.status(400).json({
        message: "กรุณากรอกข้อมูลให้ครบ",
      });
    }

    const customer_id = req.user.customer_id;

    const [menuRows] = await pool.query(
      "SELECT price FROM tbl_menus WHERE menu_id = ? AND restaurant_id = ?",
      [menu_id, restaurant_id]
    );

    if (menuRows.length === 0) {
      return res.status(400).json({
        message: "ไม่พบเมนูหรือร้านอาหารนี้",
      });
    }

    const price = parseFloat(menuRows[0].price);
    const total = price * quantity;

    const [result] = await pool.query(
      `INSERT INTO tbl_orders
       (customer_id, restaurant_id, menu_id, quantity, price, total, status, create_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Processing', NOW())`,
      [customer_id, restaurant_id, menu_id, quantity, price, total]
    );

    res.json({
      message: "เพิ่มคำสั่งซื้อเรียบร้อย",
      order_id: result.insertId,
      total: total,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการเพิ่มคำสั่งซื้อ",
    });
  }
});

/**
 * @swagger
 * /api/orders/summary:
 *   get:
 *     summary: ดูสรุปยอดการสั่งซื้อของฉัน
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: สรุปยอดเงินรวมทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customer_name:
 *                   type: string
 *                 total_amount:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */
router.get("/summary", auth, async (req, res) => {
  try {
    const customer_id = req.user.customer_id;

    const [rows] = await pool.query(
      `SELECT c.fullname AS customer_name, SUM(o.total) AS total_amount
       FROM tbl_orders AS o
       JOIN tbl_customers AS c ON o.customer_id = c.customer_id
       JOIN tbl_menus AS m ON o.menu_id = m.menu_id
       WHERE o.customer_id = ?
       GROUP BY c.customer_id`,
      [customer_id]
    );

    if (rows.length === 0) {
      return res.json({
        customer_name: "",
        total_amount: 0,
      });
    }

    res.json({
      customer_name: rows[0].customer_name,
      total_amount: parseFloat(rows[0].total_amount || 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายงานยอดสั่งซื้อ",
    });
  }
});

module.exports = router;
