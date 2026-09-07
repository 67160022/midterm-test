# โครงโปรเจกต์ — ข้อสอบกลางภาค ส่วนที่ 2

โฟลเดอร์นี้เป็น **โครงโปรเจกต์ Express + MySQL + Redis** สำหรับต่อยอดในห้องสอบ
โจทย์และเกณฑ์คะแนนอยู่ในกระดาษข้อสอบที่ผู้คุมสอบแจกให้

## ขั้นตอนเริ่มต้น (ทำตามลำดับ)

เครื่องในห้องสอบมี Docker Desktop และ Node.js ติดตั้งไว้แล้ว และไฟล์นี้มี `node_modules/` มาให้ครบ **ไม่ต้องรัน `npm install`**

```bash
# 1. แตกไฟล์ midterm-project-init.zip แล้วเปิด terminal ในโฟลเดอร์ที่แตกออกมา

# 2. คัดลอกไฟล์ตั้งค่า (ค่าเริ่มต้นใช้ได้เลย ไม่ต้องแก้)
cp .env.example .env

# 3. เปิด MySQL + Redis ด้วย Docker
docker compose up -d
#    ครั้งแรกใช้เวลาสักครู่ให้ MySQL พร้อม — คำสั่งถัดไปจะรอให้เอง

# 4. สร้างตารางและข้อมูลตัวอย่าง (รอ MySQL อัตโนมัติถ้ายังไม่พร้อม)
npm run seed

# 5. รันเซิร์ฟเวอร์
npm run dev
#    เปิดที่ http://localhost:3000
```

หากรอบใดผิดพลาดให้เริ่มใหม่จากข้อ 3 (`docker compose down -v` แล้ว `up -d` ใหม่)

## Token ทดสอบ (ใช้เมื่อโจทย์กำหนดให้แนบ `Authorization: Bearer <token>`)

| role    | token             |
| ------- | ----------------- |
| admin   | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LWFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzg4NDE5NDY4LCJleHAiOjE3OTM2MDM0Njh9.qUEq23N2VOEMIxLC_5zRx2lZAfc1ZCjtf6HNKUuywmg`   |
| student | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LXN0dWRlbnQiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc4ODQxOTQ2OCwiZXhwIjoxNzkzNjAzNDY4fQ.ykNhdholKEscuPjULklLVu_L3V88Q2dGzdGoal9e59U` |

`JWT_SECRET` สำหรับตรวจ token อยู่ใน `.env.example`

## ไฟล์ที่แก้ได้

- `routes/courses.js` — ไฟล์เดียวที่แก้
- `answers.md` — สร้างไฟล์นี้เองในโฟลเดอร์หลัก (ถ้าโจทย์กำหนด)

**ห้ามแก้:** `index.js`, `db.js`, `cache.js`, `middlewares/auth.js`, `config.js`, `seed.sql`, `scripts/`, `docker-compose.yml`

## สิ่งที่มีให้แล้ว (ไม่ต้องเขียนเอง)

- `pool` (`db.js`) — MySQL connection pool
- `redisClient` (`cache.js`) — เชื่อมต่อ Redis สำเร็จแล้ว
- `middlewares/auth.js` — ส่งออก `authMiddleware` (ตรวจ JWT แนบ `req.user = { sub, role }`) และ `requireRole(role)`
- `index.js` — ประกาศและ mount `v1Router` ที่ `/api/v1`, `v2Router` ที่ `/api/v2` พร้อม `express.json()`
- ฐานข้อมูลที่ seed แล้ว (ดูโครงสร้างตารางในกระดาษข้อสอบ)
- `routes/courses.js` — มี `GET`/`POST /api/v1/courses` ที่ query ฐานข้อมูลโดยตรง + โครง `ALLOWED_SORT_FIELDS`

## วิธีส่งงาน

zip เฉพาะสิ่งเหล่านี้ (ห้ามรวม `node_modules`): `routes/courses.js` และ `answers.md`
ตั้งชื่อ `<รหัสนิสิต>.zip` แล้วส่งตามช่องทางที่ผู้สอนกำหนด
