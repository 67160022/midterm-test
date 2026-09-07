// รัน seed.sql เข้าฐานข้อมูล + สร้าง exam_db ถ้ายังไม่มี
// ใช้: npm run seed
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { db } = require("../config");
const { redisClient, connectRedis } = require("../cache");

// รอ MySQL พร้อมรับ connection (นิสิตมักรัน seed ทันทีหลัง docker compose up)
async function connectWithRetry(tries = 30) {
  for (let i = 1; i <= tries; i++) {
    try {
      return await mysql.createConnection({
        host: db.host,
        port: db.port,
        user: db.user,
        password: db.password,
        multipleStatements: true,
      });
    } catch (err) {
      if (i === tries) throw err;
      if (i === 1) console.log("กำลังรอ MySQL พร้อมใช้งาน...");
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function main() {
  const conn = await connectWithRetry();
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${db.database}\` CHARACTER SET utf8mb4`,
  );
  await conn.query(`USE \`${db.database}\``);
  const sql = fs.readFileSync(path.join(__dirname, "..", "seed.sql"), "utf8");
  await conn.query(sql);
  const table = (sql.match(/CREATE TABLE (\w+)/i) || [])[1] || "?";
  const [[{ n }]] = await conn.query(`SELECT COUNT(*) AS n FROM \`${table}\``);
  await conn.end();

  // ล้าง cache ให้เริ่มสอบ/ตรวจจากสถานะสะอาด
  try {
    await connectRedis();
    await redisClient.flushDb();
    await redisClient.quit();
  } catch (err) {
    console.warn("เตือน: ล้าง Redis ไม่สำเร็จ:", err.message);
  }

  console.log(`seed สำเร็จ: ${db.database}.${table} (${n} ระเบียน) + flush Redis`);
}

main().catch((err) => {
  console.error("seed ล้มเหลว:", err.message);
  process.exit(1);
});
