const jwt = require("jsonwebtoken");
require("dotenv").config(); // <--- เพิ่มบรรทัดนี้ครับ สำคัญมาก!

module.exports = (req, res, next) => {
  try {
    const header = req.header("Authorization");

    if (!header) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const token = header.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // จุดนี้ถ้าไม่มี dotenv.config() ค่า process.env.JWT_SECRET จะเป็น undefined ทำให้ verify ไม่ผ่าน
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // แนะนำให้ console.log(err) ดูครับ ถ้าอยากรู้ว่า error อะไร
    console.log("Auth Error:", err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};
