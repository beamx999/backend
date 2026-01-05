const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: ดึงข้อมูลลูกค้าทั้งหมด
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายชื่อลูกค้า
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       customer_id:
 *                         type: integer
 *                       firstname:
 *                         type: string
 *                       lastname:
 *                         type: string
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */

router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT customer_id, firstname, lastname, username, email FROM tbl_customers"
    );
    res.json({ customers: rows });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

module.exports = router;
