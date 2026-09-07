// สร้าง JWT ทดสอบ 2 ใบ (admin, student) แล้วเขียนลง README-exam.md
// ผู้สอนรันครั้งเดียวหลังตั้งค่า .env: npm run tokens
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");

// อายุยาว (60 วัน) เผื่อ build zip ล่วงหน้าหลายสัปดาห์ + ช่วงตรวจงาน
const opts = { expiresIn: "60d" };
const adminToken = jwt.sign({ sub: "u-admin", role: "admin" }, jwtSecret, opts);
const studentToken = jwt.sign(
  { sub: "u-student", role: "student" },
  jwtSecret,
  opts,
);

const readmePath = path.join(__dirname, "..", "README-exam.md");
let readme = fs.readFileSync(readmePath, "utf8");
readme = readme
  .replace(/<ADMIN_TOKEN>/g, adminToken)
  .replace(/<STUDENT_TOKEN>/g, studentToken);
fs.writeFileSync(readmePath, readme);

console.log("เขียน token ลง README-exam.md แล้ว");
console.log("admin  :", adminToken);
console.log("student:", studentToken);
