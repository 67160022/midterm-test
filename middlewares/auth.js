// ตรวจ JWT + role — พร้อมใช้งาน ไม่ต้องแก้ไข
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");

// ตรวจ Bearer token, แนบ req.user = { sub, role }
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "ไม่พบ token" });
  }
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch (err) {
    return res.status(401).json({ message: "token ไม่ถูกต้องหรือหมดอายุ" });
  }
}

// อนุญาตเฉพาะ role ที่กำหนด (ใช้หลัง authMiddleware)
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
