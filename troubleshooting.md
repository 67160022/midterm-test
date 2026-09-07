# การแก้ปัญหาการติดตั้งโปรเจกต์สอบกลางภาค (midterm-project-init)

เอกสารนี้สรุปปัญหาที่พบบ่อยระหว่างการเตรียมสภาพแวดล้อมบนเครื่อง Windows พร้อมวิธีแก้ไข

## สารบัญ

- [1. `docker compose up -d` แจ้ง `no matching manifest for windows(...)/amd64`](#1-docker-compose-up--d-แจ้ง-no-matching-manifest-for-windowsamd64)
- [2. `npm` แจ้ง `running scripts is disabled on this system`](#2-npm-แจ้ง-running-scripts-is-disabled-on-this-system)
- [3. `npm run seed` แจ้ง `Cannot find module 'mysql2/promise'`](#3-npm-run-seed-แจ้ง-cannot-find-module-mysql2promise)
- [4. การตรวจสอบข้อมูลในฐานข้อมูลหลังจากรัน seed](#4-การตรวจสอบข้อมูลในฐานข้อมูลหลังจากรัน-seed)
- [ลำดับขั้นตอนที่ถูกต้องโดยสรุป](#ลำดับขั้นตอนที่ถูกต้องโดยสรุป)

## 1. `docker compose up -d` แจ้ง `no matching manifest for windows(...)/amd64`

**อาการ**

```
no matching manifest for windows(10.0.26200)/amd64 in the manifest list entries
```

**สาเหตุ**

Docker Desktop ทำงานในโหมด Windows containers ขณะที่อิมเมจ `mysql:8.0` และ `redis:7` เป็นอิมเมจ Linux

**วิธีแก้**

1. คลิกขวาที่ไอคอน Docker (รูปวาฬ) ใน system tray มุมขวาล่าง (อาจอยู่ในเมนู `^` ที่ซ่อนไว้)
2. เลือก **Switch to Linux containers...**
3. รอประมาณ 30 วินาทีให้ Docker Desktop รีสตาร์ต
4. ตรวจสอบด้วย `docker version` โดยดูส่วน **Server** ที่บรรทัด `OS/Arch` ต้องเป็น `linux/amd64`
5. รัน `docker compose up -d` อีกครั้ง

หากเมนูคลิกขวาไม่มีตัวเลือก Switch to Linux containers ให้เปิด Docker Desktop ไปที่ **Settings > General** เลือก **Use the WSL 2 based engine** แล้วกด **Apply & Restart**

## 2. `npm` แจ้ง `running scripts is disabled on this system`

**อาการ**

```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
    + FullyQualifiedErrorId : UnauthorizedAccess
```

**สาเหตุ**

นโยบายการรันสคริปต์ของ PowerShell (Execution Policy) ปิดการรันสคริปต์ `.ps1`

**วิธีแก้**

รันคำสั่งต่อไปนี้ (ไม่ต้องใช้สิทธิ์ผู้ดูแลระบบ) แล้วตอบ `Y`

```
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

ทางเลือกแบบไม่เปลี่ยนนโยบาย ให้เรียก `npm.cmd` แทน `npm` เช่น `npm.cmd run seed`

## 3. `npm run seed` แจ้ง `Cannot find module 'mysql2/promise'`

**อาการ**

```
Error: Cannot find module 'mysql2/promise'
  code: 'MODULE_NOT_FOUND'
```

**สาเหตุ**

ยังไม่ได้ติดตั้ง dependencies ของโปรเจกต์

**วิธีแก้**

```
npm install
```

จากนั้นจึงรัน `npm run seed`

## 4. การตรวจสอบข้อมูลในฐานข้อมูลหลังจากรัน seed

เข้าถึง MySQL ในคอนเทนเนอร์เพื่อยืนยันว่าตารางและข้อมูลถูกสร้างเรียบร้อย

```
docker exec -it midterm-project-init-mysql-1 mysql -u root -p
```

ป้อนรหัสผ่าน `root` จากนั้นตรวจสอบตามลำดับ

```
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| exam_db            |
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+

mysql> use exam_db;
Database changed

mysql> show tables;
+----------------------+
| Tables_in_exam_db    |
+----------------------+
| course_prerequisites |
| courses              |
+----------------------+

mysql> select * from courses;
```

ตาราง `courses` ควรมีข้อมูล 30 แถว (id 1 ถึง 30) และตาราง `course_prerequisites` เก็บความสัมพันธ์วิชาบังคับก่อน หากผลลัพธ์ตรงตามนี้แสดงว่าสภาพแวดล้อมพร้อมสำหรับการสอบ

ออกจาก MySQL ด้วยคำสั่ง `exit`

> หมายเหตุ ชื่อคอนเทนเนอร์ `midterm-project-init-mysql-1` มาจากชื่อโฟลเดอร์โปรเจกต์ หากวางโปรเจกต์ไว้ในโฟลเดอร์ชื่ออื่น ให้ตรวจสอบชื่อที่แท้จริงด้วย `docker ps`

## ลำดับขั้นตอนที่ถูกต้องโดยสรุป

1. เปิด Docker Desktop และตรวจสอบว่าอยู่ในโหมด Linux containers
2. `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` (ทำครั้งเดียวต่อเครื่อง)
3. `docker compose up -d`
4. `npm install`
5. `npm run seed`
