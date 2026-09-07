// เซิร์ฟเวอร์หลัก — พร้อมใช้งาน ไม่ต้องแก้ไข
const express = require("express");
const { connectRedis } = require("./cache");
const registerCourseRoutes = require("./routes/courses");
const { port } = require("./config");

const app = express();
app.use(express.json());

// router ของแต่ละเวอร์ชัน — ประกาศและ mount ไว้ให้แล้ว
const v1Router = express.Router();
const v2Router = express.Router();

registerCourseRoutes(v1Router, v2Router);

app.use("/api/v1", v1Router);
app.use("/api/v2", v2Router);

// error handler กลาง
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
});

async function start() {
  await connectRedis();
  app.listen(port, () => {
    console.log(`exam server listening on http://localhost:${port}`);
  });
}

// export app สำหรับ autograder; start เมื่อเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  start().catch((err) => {
    console.error("เริ่มเซิร์ฟเวอร์ไม่สำเร็จ:", err.message);
    process.exit(1);
  });
}

module.exports = { app, start };
