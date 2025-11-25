// src/routes/facils.ts
import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

/**
 * GET /facils
 * 전체 시설물 목록 조회
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM parking_info"); // 테이블명 확인해서 바꾸세요
    res.json(rows);
  } catch (err) {
    console.error("Error fetching facils:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch facilities" });
  }
});

/**
 * GET /facils/:id
 * 특정 id 시설물 조회
 */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: "Invalid id" });
    }

    const [rows] = await pool.query("SELECT * FROM facil WHERE id = ?", [id]);

    // rows 타입이 any라서 배열인지 체크
    const result = rows;

    if (result.length === 0) {
      return res.status(404).json({ ok: false, message: "Facility not found" });
    }

    res.json(result[0]);
  } catch (err) {
    console.error("Error fetching facil by id:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch facility" });
  }
});

export default router;
