const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/**
 * @swagger
 * /api/menus:
 *   get:
 *     summary: ดึงข้อมูลเมนูอาหารทั้งหมด
 *     tags: [Menus]
 *     responses:
 *       200:
 *         description: รายการเมนูทั้งหมด
 */

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, r.name as restaurant_name 
      FROM tbl_menus m 
      LEFT JOIN tbl_restaurants r ON m.restaurant_id = r.restaurant_id
    `);
    res.json({ menus: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
});

module.exports = router;
