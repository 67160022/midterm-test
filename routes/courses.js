const { pool } = require("../db");
const { redisClient } = require("../cache");
const { authMiddleware, requireRole } = require("../middlewares/auth");

const ALLOWED_SORT_FIELDS = ["course_name", "credit", "created_at"];

module.exports = function registerCourseRoutes(v1Router, v2Router) {
  // =========================
  // GET courses
  // Auth + Cache + Pagination
  // =========================
  v1Router.get("/courses", authMiddleware, async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const courseName = req.query.course_name || "";

      let sortBy = req.query.sortBy || "created_at";

      if (!ALLOWED_SORT_FIELDS.includes(sortBy)) {
        sortBy = "created_at";
      }

      let order = req.query.order || "ASC";

      if (order !== "ASC" && order !== "DESC") {
        order = "ASC";
      }

      // Cache key
      const cacheKey = `courses:${page}:${limit}:${courseName}:${sortBy}:${order}`;

      // เช็ค Redis ก่อน
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Filter
      let sql = "SELECT * FROM courses";
      const params = [];

      if (courseName) {
        sql += " WHERE course_name LIKE ?";
        params.push(`%${courseName}%`);
      }

      // Sort + Pagination
      sql += ` ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;

      params.push(limit);
      params.push(offset);

      const [rows] = await pool.query(sql, params);

      const response = {
        message: "สำเร็จ",
        data: rows,
        pagination: {
          page,
          limit,
        },
      };

      // เก็บลง Redis
      await redisClient.set(cacheKey, JSON.stringify(response), { EX: 60 });

      res.json(response);
    } catch (err) {
      next(err);
    }
  });

  // =========================
  // POST courses
  // Auth + Admin + Transaction
  // =========================
  v1Router.post(
    "/courses",
    authMiddleware,
    requireRole("admin"),
    async (req, res, next) => {
      const { course_name, credit, prerequisites = [] } = req.body;

      const connection = await pool.getConnection();

      try {
        // เริ่ม Transaction
        await connection.beginTransaction();

        // เพิ่ม course
        const [result] = await connection.query(
          `INSERT INTO courses (course_name, credit)
           VALUES (?, ?)`,
          [course_name, credit],
        );

        const courseId = result.insertId;

        // เพิ่ม prerequisite
        for (const prereqId of prerequisites) {
          await connection.query(
            `INSERT INTO course_prerequisites
             (course_id, prereq_course_id)
             VALUES (?, ?)`,
            [courseId, prereqId],
          );
        }

        // บันทึกทั้งหมด
        await connection.commit();

        // ล้าง cache
        for await (const key of redisClient.scanIterator({
          MATCH: "courses:*",
        })) {
          await redisClient.del(key);
        }

        res.status(201).json({
          message: "เพิ่มข้อมูลสำเร็จ",
          data: {
            id: courseId,
          },
        });
      } catch (err) {
        // ถ้า error ยกเลิกทั้งหมด
        await connection.rollback();

        next(err);
      } finally {
        // คืน connection
        connection.release();
      }
    },
  );

  // =========================
  // V2 API
  // =========================
  v2Router.get("/courses", authMiddleware, async (req, res, next) => {
    try {
      const [rows] = await pool.query("SELECT * FROM courses ORDER BY id");

      res.json({
        version: "v2",
        courses: rows,
      });
    } catch (err) {
      next(err);
    }
  });
};
