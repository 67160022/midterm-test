const { pool } = require("../db");

module.exports = function registerCourseRoutes(v1Router, v2Router) {

// ==========================================
// V1 Courses API
// ==========================================

// 1. GET: ดึงรายการรายวิชาทั้งหมด
v1Router.get("/courses", async (req, res, next) => {
try {
const [rows] = await pool.query(
"SELECT \* FROM courses"
);

      res.status(200).json({
        message: "สำเร็จ",
        data: rows,
      });

    } catch (err) {
      next(err);
    }

});

// 2. GET: ดึงข้อมูลรายวิชาตาม id
v1Router.get("/courses/:id", async (req, res, next) => {
try {
const [rows] = await pool.query(
"SELECT \* FROM courses WHERE id = ?",
[req.params.id]
);

      // ไม่พบข้อมูล
      if (rows.length === 0) {
        return res.status(404).json({
          error: {
            code: "NOT_FOUND",
            message: "ไม่พบข้อมูลรายวิชา",
          },
        });
      }

      res.status(200).json({
        message: "สำเร็จ",
        data: rows[0],
      });

    } catch (err) {
      next(err);
    }

});

// 3. POST: เพิ่มรายวิชาใหม่
v1Router.post("/courses", async (req, res, next) => {
const { course_name, credit } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!course_name || !credit) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "กรุณาระบุ course_name และ credit ให้ครบถ้วน",
        },
      });
    }

    try {
      const [result] = await pool.query(
        "INSERT INTO courses (course_name, credit) VALUES (?, ?)",
        [course_name, credit]
      );

      res.status(201).json({
        message: "เพิ่มข้อมูลสำเร็จ",
        data: {
          id: result.insertId,
          course_name,
          credit,
        },
      });

    } catch (err) {
      next(err);
    }

});

// 4. PUT: แก้ไขข้อมูลรายวิชาทั้งหมด
v1Router.put("/courses/:id", async (req, res, next) => {
const { course_name, credit } = req.body;

    // ตรวจสอบข้อมูล
    if (!course_name || !credit) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "กรุณาระบุ course_name และ credit ให้ครบถ้วน",
        },
      });
    }

    try {
      const [result] = await pool.query(
        `
          UPDATE courses
          SET course_name = ?, credit = ?
          WHERE id = ?
        `,
        [course_name, credit, req.params.id]
      );

      // ไม่พบ id
      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: {
            code: "NOT_FOUND",
            message: "ไม่พบข้อมูลรายวิชา",
          },
        });
      }

      res.status(200).json({
        message: "แก้ไขข้อมูลสำเร็จ",
        data: {
          id: Number(req.params.id),
          course_name,
          credit,
        },
      });

    } catch (err) {
      next(err);
    }

});

// 5. DELETE: ลบรายวิชา
v1Router.delete("/courses/:id", async (req, res, next) => {
try {
const [result] = await pool.query(
"DELETE FROM courses WHERE id = ?",
[req.params.id]
);

      // ไม่พบ id
      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: {
            code: "NOT_FOUND",
            message: "ไม่พบข้อมูลรายวิชา",
          },
        });
      }

      res.status(200).json({
        message: "ลบข้อมูลสำเร็จ",
      });

    } catch (err) {
      next(err);
    }

});

// ==========================================
// V2 Courses API
// ==========================================

// 6. GET: ดึงรายวิชาแบบ Filter
v2Router.get("/courses", async (req, res, next) => {
const { minCredit } = req.query;

    try {
      let sql = "SELECT * FROM courses";
      const values = [];

      // ถ้ามี minCredit ให้กรองข้อมูล
      if (minCredit !== undefined) {
        sql += " WHERE credit >= ?";
        values.push(minCredit);
      }

      const [rows] = await pool.query(sql, values);

      res.status(200).json({
        message: "สำเร็จ",
        data: rows,
      });

    } catch (err) {
      next(err);
    }

});

};
