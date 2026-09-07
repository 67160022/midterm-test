# คู่มือตรวจสอบ API ด้วย Postman (Exam Test Suite)

เอกสารนี้ใช้สำหรับตรวจสอบการทำงานของ **`routes/courses.js`** ในโปรแกรม **Postman** ครบทุกข้อตามเกณฑ์ข้อสอบปฏิบัติ (15 คะแนนเต็ม)

---

## 🚀 วิธีนำเข้าชุดทดสอบเข้า Postman ใน 1 วินาที (เร็วที่สุดในห้องสอบ)

ในโฟลเดอร์โปรเจกต์มีไฟล์ **`courses-api.postman_collection.json`** เตรียมไว้ให้แล้ว:

1. เปิดโปรแกรม **Postman**
2. กดปุ่ม **Import** (บริเวณมุมบนซ้ายของ Postman)
3. ลากไฟล์ `courses-api.postman_collection.json` มาวาง หรือกดเลือกไฟล์จากโฟลเดอร์โปรเจกต์
4. จะปรากฏ Collection ชื่อ **`Midterm Courses API Test Suite`**
5. ใน Collection จะมีครบทั้ง **10 Requests** พร้อมตั้งค่า Header, Token, Body และเขียน Test Scripts ให้เรียบร้อย
   - สามารถกดปุ่ม **Run Collection** เพื่อให้ Postman ตรวจสอบให้ทุกข้อแบบอัตโนมัติ (ขึ้นแถบเขียว `PASS` ทุกข้อ)

---

## 🔑 ข้อมูล Token สำหรับกรอกใน Postman

คัดลอกค่า Token ด้านล่างไปใส่ในแท็บ **Headers** หรือแท็บ **Authorization** ใน Postman:

| บทบาท (Role) |         สิทธิ์         | Token                                                                                                                                                                             |
| :----------- | :--------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **admin**    |      สร้างวิชาได้      | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LWFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzg4NDE5NDY4LCJleHAiOjE3OTM2MDM0Njh9.qUEq23N2VOEMIxLC_5zRx2lZAfc1ZCjtf6HNKUuywmg`       |
| **student**  | ดึงข้อมูลได้อย่างเดียว | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LXN0dWRlbnQiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc4ODQxOTQ2OCwiZXhwIjoxNzkzNjAzNDY4fQ.ykNhdholKEscuPjULklLVu_L3V88Q2dGzdGoal9e59U` |

> **วิธีใส่ Token ใน Postman:**  
> ไปที่แท็บ **Authorization** $\rightarrow$ ช่อง **Type** เลือก **Bearer Token** $\rightarrow$ วาง Token ในช่อง **Token**  
> _(หรือไปที่แท็บ **Headers** $\rightarrow$ Key: `Authorization` $\rightarrow$ Value: `Bearer <token>`)_

---

## 📋 รายละเอียดการตั้งค่าใน Postman ทีละคำขอ (10 Test Cases)

ก่อนกด Send ตรวจสอบให้แน่ใจว่าได้เปิดเซิร์ฟเวอร์ด้วย `npm run dev` อยู่ที่พอร์ต `3000`

---

### [ข้อสอบข้อที่ 2 & 1] หมวด GET /api/v1/courses (Pagination, Sorting, Filtering, Caching)

#### 1. ค่าเริ่มต้น Default Pagination (10 รายการแรก)

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/courses`
- **Params / Headers / Body:** ไม่ต้องกรอก
- **สิ่งที่ต้องตรวจสอบใน Response:**
  - **Status:** `200 OK`
  - มีโครงสร้าง `pagination` คืนกลับมา:
    ```json
    {
      "message": "สำเร็จ",
      "data": [ ...วิชา 10 รายการ... ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 30,
        "totalPages": 3
      }
    }
    ```
- **สคริปต์ในแท็บ Tests ของ Postman:**
  ```javascript
  pm.test("Status is 200 OK", () => pm.response.to.have.status(200));
  pm.test("Default page=1, limit=10", () => {
    const res = pm.response.json();
    pm.expect(res.pagination.page).to.eql(1);
    pm.expect(res.pagination.limit).to.eql(10);
    pm.expect(res.data.length).to.be.at.most(10);
  });
  ```

---

#### 2. ทดสอบแบ่งหน้า (Pagination: page=2, limit=5)

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/courses`
- **แท็บ Params (Query Params):**
  | Key | Value | คำอธิบาย |
  | :--- | :--- | :--- |
  | `page` | `2` | ขอหน้าที่ 2 |
  | `limit` | `5` | แสดง 5 รายการต่อหน้า |
- **สิ่งที่ต้องตรวจสอบใน Response:**
  - **Status:** `200 OK`
  - `pagination.page` เท่ากับ `2`
  - `pagination.limit` เท่ากับ `5`
  - ข้อมูลใน `data` มีจำนวน 5 รายการ และเริ่มต้นด้วยวิชาตัวที่ 6 (ไม่ซ้ำกับหน้า 1)

---

#### 3. ทดสอบการเรียงลำดับ Allowlist (Sorting: credit จากมากไปน้อย)

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/courses`
- **แท็บ Params (Query Params):**
  | Key | Value | คำอธิบาย |
  | :--- | :--- | :--- |
  | `sort` | `credit` | เรียงตามคอลัมน์ credit |
  | `order` | `desc` | เรียงจากมากไปหาน้อย |
- **สิ่งที่ต้องตรวจสอบใน Response:**
  - **Status:** `200 OK`
  - วิชาแรกใน `data` จะต้องมี `credit: 4` หรือ `credit: 3` เรียงลงมาหาวิชาที่มี `credit: 1`
- **สคริปต์ในแท็บ Tests ของ Postman:**
  ```javascript
  pm.test("Status is 200 OK", () => pm.response.to.have.status(200));
  pm.test("Sorted credit DESC", () => {
    const res = pm.response.json();
    const first = res.data[0].credit;
    const last = res.data[res.data.length - 1].credit;
    pm.expect(first).to.be.at.least(last);
  });
  ```

---

#### 4. ทดสอบความปลอดภัย Allowlist (ป้องกัน SQL Injection ใน ORDER BY)

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/courses`
- **แท็บ Params (Query Params):**
  | Key | Value | คำอธิบาย |
  | :--- | :--- | :--- |
  | `sort` | `malicious_col;DROP` | ส่งชื่อคอลัมน์แปลกปลอม |
- **สิ่งที่ต้องตรวจสอบใน Response:**
  - **Status:** `200 OK`
  - **ห้ามเกิด Status 500 หรือ Database Syntax Error**
  - ระบบตัดทิ้งแล้ว fallback ไปเรียงด้วย `id ASC` อย่างปลอดภัย

---

#### 5. ทดสอบการกรองข้อมูล (Filtering: minCredit & search)

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/courses`
- **แท็บ Params (Query Params):**
  | Key | Value | คำอธิบาย |
  | :--- | :--- | :--- |
  | `minCredit` | `3` | หน่วยกิตตั้งแต่ 3 ขึ้นไป |
  | `search` | `Systems` | ค้นหาชื่อวิชาที่มีคำว่า Systems |
- **สิ่งที่ต้องตรวจสอบใน Response:**
  - **Status:** `200 OK`
  - ทุกวิชาใน `data` จะต้องมี `credit >= 3` และชื่อวิชาต้องมีคำว่า `Systems`

---

#### 6. ทดสอบ Redis Cache-Aside (วัดความเร็วรอบ 1 และรอบ 2)

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/courses?page=1&limit=10`
- **การทดสอบ:** กดปุ่ม **Send** ติดกัน 2 ครั้ง
  - **ครั้งที่ 1 (Cache Miss):** ดึงจาก MySQL สังเกตตัวเลข Time ด้านขวาบน จะอยู่ที่ประมาณ `20 ms - 60 ms`
  - **ครั้งที่ 2 (Cache Hit):** ดึงจาก Redis สังเกตตัวเลข Time จะลดลงเหลือประมาณ `3 ms - 8 ms` (ตอบสนองเร็วกว่าเดิมมาก)

---

### [ข้อสอบข้อที่ 1 & 3] หมวด POST /api/v1/courses (JWT, RBAC & Transaction)

#### 7. ทดสอบ Authentication: ไม่ส่ง Token (ต้องปฏิเสธ)

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/courses`
- **แท็บ Authorization:** เลือก `No Auth`
- **แท็บ Headers:**
  - `Content-Type`: `application/json`
- **แท็บ Body:** เลือก **raw** $\rightarrow$ เลือก **JSON**
  ```json
  {
    "course_name": "Unauthorized Course",
    "credit": 3
  }
  ```
- **สิ่งที่ต้องตรวจสอบใน Response:**
  - **Status:** `401 Unauthorized`
  - Body: `{"message":"กรุณาแนบ token"}`

---

#### 8. ทดสอบ Authorization / RBAC: ส่ง Student Token (ไม่มีสิทธิ์)

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/courses`
- **แท็บ Authorization:**
  - **Type:** `Bearer Token`
  - **Token:** วาง **Student Token**
- **แท็บ Headers:**
  - `Content-Type`: `application/json`
- **แท็บ Body:** เลือก **raw** $\rightarrow$ เลือก **JSON**
  ```json
  {
    "course_name": "Student Cannot Create",
    "credit": 3
  }
  ```
- **สิ่งที่ต้องตรวจสอบใน Response:**
  - **Status:** `403 Forbidden`
  - Body: `{"message":"ไม่มีสิทธิ์เข้าถึง"}`

---

#### 9. ทดสอบ Admin สร้างวิชาพร้อมวิชาบังคับก่อน (Database Transaction)

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/courses`
- **แท็บ Authorization:**
  - **Type:** `Bearer Token`
  - **Token:** วาง **Admin Token**
- **แท็บ Headers:**
  - `Content-Type`: `application/json`
- **แท็บ Body:** เลือก **raw** $\rightarrow$ เลือก **JSON**
  ```json
  {
    "course_name": "Distributed Cloud Computing",
    "credit": 3,
    "prerequisites": [1, 2]
  }
  ```
- **สิ่งที่ต้องตรวจสอบใน Response:**
  - **Status:** `201 Created`
  - Body คืน ID ใหม่ที่ถูกสร้างขึ้น:
    ```json
    {
      "message": "เพิ่มข้อมูลสำเร็จ",
      "data": {
        "id": 31
      }
    }
    ```
- **สคริปต์ในแท็บ Tests ของ Postman:**
  ```javascript
  pm.test("Status is 201 Created", () => pm.response.to.have.status(201));
  pm.test("Returns new course id", () => {
    const res = pm.response.json();
    pm.expect(res.data.id).to.be.a("number");
  });
  ```

---

#### 10. ทดสอบ Cache Invalidation หลัง POST

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/courses`
- **แท็บ Params (Query Params):**
  | Key | Value |
  | :--- | :--- |
  | `search` | `Distributed` |
- **สิ่งที่ต้องตรวจสอบใน Response:**
  - **Status:** `200 OK`
  - พบวิชา "Distributed Cloud Computing" ในผลลัพธ์ทันที แสดงว่าคำสั่ง `redisClient.del()` ใน POST ทำงานถูกต้อง แคชเก่าถูกลบ และดึงข้อมูลใหม่ล่าสุดจาก MySQL

---

### [ข้อสอบข้อที่ 4] หมวด GET /api/v2/courses (API Versioning)

#### 11. ตรวจสอบ Endpoint v2

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v2/courses`
- **Params / Headers / Body:** ไม่ต้องกรอก
- **สิ่งที่ต้องตรวจสอบใน Response:**
  - **Status:** `200 OK`
  - มีโครงสร้างแบบ v2 ดังนี้:
    ```json
    {
      "version": "2.0",
      "message": "สำเร็จ",
      "total": 31,
      "data": [
        {
          "id": 1,
          "courseName": "Introduction to Computer Science",
          "credit": 3,
          "createdAt": "2026-...",
          "prerequisites": []
        },
        ...
      ]
    }
    ```
  - จุดสังเกตที่ให้คะแนน:
    1. มีฟิลด์ `"version": "2.0"` อยู่ด้านนอก
    2. ฟิลด์ชื่อวิชาเป็น camelCase: `"courseName"` (ไม่ใช่ `course_name`)
    3. แต่ละวิชามี array `"prerequisites"` ฝังอยู่ข้างใน

---

## 🎯 สรุป Checklist ก่อนส่งงาน (Zip ส่งเฉพาะ 2 ไฟล์)

เมื่อทดสอบใน Postman ผ่านครบทุกข้อแล้ว:

1. ตรวจสอบว่ามีไฟล์ `answers.md` อยู่ที่โฟลเดอร์หลัก และตอบครบ 4 ข้อ
2. เปิด PowerShell ที่โฟลเดอร์โปรเจกต์ แล้วรันคำสั่งบีบอัด Zip:
   ```powershell
   Compress-Archive -Path routes\courses.js, answers.md -DestinationPath 67160028.zip -Force
   ```
3. ตรวจสอบว่าในไฟล์ zip มีเพียง `routes/courses.js` และ `answers.md` เท่านั้น (ห้ามมีโฟลเดอร์ `node_modules` ติดไป)
