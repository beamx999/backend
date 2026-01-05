const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: สมัครสมาชิกใหม่
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - firstname
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               firstname:
 *                 type: string
 *               fullname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               sex:
 *                 type: string
 *               birthday:
 *                 type: string
 *                 format: date
 *                 example: "2000-01-01"
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: สมัครสมาชิกสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบ หรือชื่อซ้ำ
 */
router.post("/register", async (req, res) => {
  try {
    const {
      firstname,
      fullname,
      lastname,
      username,
      password,
      address,
      sex,
      birthday,
    } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูล" });
    }

    const [userCheck] = await pool.query(
      "SELECT id FROM tbl_users WHERE username = ?",
      [username]
    );

    if (userCheck.length > 0) {
      return res.status(400).json({ message: "ชื่อนี้มีผู้ใช้งานแล้ว" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      `
      INSERT INTO tbl_users (
        firstname,
        fullname,
        lastname,
        username,
        password,
        address,
        sex,
        birthday,
        create_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        firstname,
        fullname,
        lastname,
        username,
        hashedPassword,
        address,
        sex,
        birthday,
      ]
    );

    res.json({ message: "สมัครสมาชิกสำเร็จ" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: เข้าสู่ระบบ (รับ JWT Token)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: user_1234
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Username หรือ Password ไม่ถูกต้อง
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM tbl_users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "ไม่พบชื่อผู้ใช้นี้" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
