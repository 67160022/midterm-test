-- โครงสร้างและข้อมูลตัวอย่างสำหรับข้อสอบกลางภาค ส่วนที่ 2 (ชุดหลัก)
-- รัน: mysql -u root -p exam_db < seed.sql   หรือ  npm run seed
DROP TABLE IF EXISTS course_prerequisites;
DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(200) NOT NULL,
  credit INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางวิชาบังคับก่อน (prerequisite) — course_id และ prereq_course_id อ้าง courses.id
CREATE TABLE course_prerequisites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  prereq_course_id INT NOT NULL,
  CONSTRAINT fk_cp_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_cp_prereq FOREIGN KEY (prereq_course_id) REFERENCES courses(id)
);

-- 30 ระเบียน credit กระจาย: credit=1 มี 5 แถว, credit=2 มี 2, credit=3 มี 17, credit=4 มี 6
--   minCredit=3 -> 23 แถว, minCredit=4 -> 6 แถว, minCredit=5 -> 0 แถว
-- created_at ไล่ย้อนหลังทีละวันเพื่อให้ sort=created_at ตรวจได้ deterministic
INSERT INTO courses (course_name, credit, created_at) VALUES
('Introduction to Programming', 3, '2025-01-01 09:00:00'),
('Discrete Mathematics', 3, '2025-01-02 09:00:00'),
('Calculus I', 4, '2025-01-03 09:00:00'),
('Physics for Engineers', 4, '2025-01-04 09:00:00'),
('English Communication', 2, '2025-01-05 09:00:00'),
('Data Structures', 3, '2025-01-06 09:00:00'),
('Object-Oriented Programming', 3, '2025-01-07 09:00:00'),
('Linear Algebra', 3, '2025-01-08 09:00:00'),
('Computer Organization', 3, '2025-01-09 09:00:00'),
('Database Systems', 3, '2025-01-10 09:00:00'),
('Operating Systems', 4, '2025-01-11 09:00:00'),
('Algorithm Design', 3, '2025-01-12 09:00:00'),
('Web Programming', 3, '2025-01-13 09:00:00'),
('Software Engineering', 3, '2025-01-14 09:00:00'),
('Computer Networks', 4, '2025-01-15 09:00:00'),
('Artificial Intelligence', 3, '2025-01-16 09:00:00'),
('Machine Learning', 3, '2025-01-17 09:00:00'),
('Cloud Computing', 3, '2025-01-18 09:00:00'),
('Cybersecurity Fundamentals', 3, '2025-01-19 09:00:00'),
('Mobile Application Development', 3, '2025-01-20 09:00:00'),
('Human-Computer Interaction', 2, '2025-01-21 09:00:00'),
('Digital Logic Design', 4, '2025-01-22 09:00:00'),
('Statistics for Data Science', 3, '2025-01-23 09:00:00'),
('Compiler Construction', 4, '2025-01-24 09:00:00'),
('Distributed Systems', 3, '2025-01-25 09:00:00'),
('Ethics in Computing', 1, '2025-01-26 09:00:00'),
('Technical Writing', 1, '2025-01-27 09:00:00'),
('Professional Seminar', 1, '2025-01-28 09:00:00'),
('Capstone Project I', 1, '2025-01-29 09:00:00'),
('Capstone Project II', 1, '2025-01-30 09:00:00');

-- prerequisite ตัวอย่าง (course_id -> ต้องผ่าน prereq_course_id ก่อน)
INSERT INTO course_prerequisites (course_id, prereq_course_id) VALUES
(6, 1),   -- Data Structures ต้องผ่าน Introduction to Programming
(7, 1),   -- Object-Oriented Programming ต้องผ่าน Introduction to Programming
(12, 6),  -- Algorithm Design ต้องผ่าน Data Structures
(16, 12); -- Artificial Intelligence ต้องผ่าน Algorithm Design
