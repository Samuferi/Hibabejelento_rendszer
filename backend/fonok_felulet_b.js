// fonokRoutes.js
import express from "express";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";

const router = express.Router();

// -------------------- ADATBÁZIS --------------------
const pool = await mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Ocsi_2018",
  database: "hibabejelento",
});

// -------------------- TOKEN ELLENŐRZÉS --------------------
function verifyFonok(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Hiányzó token!" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "fonok") {
      return res.status(403).json({ error: "Hozzáférés megtagadva!" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Érvénytelen vagy lejárt token!" });
  }
}

// -------------------- BEJELENTÉSEK LEKÉRÉSE --------------------
router.get("/problems", verifyFonok, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [problems] = await conn.execute(`
      SELECT p.problem_id, p.helyszin, p.leiras, p.idopont, p.status,
             u.user_id, u.vezeteknev, u.keresztnev
      FROM problems p
      LEFT JOIN users u ON p.assigned_to = u.user_id
      ORDER BY p.idopont DESC
    `);
    conn.release();
    res.json(problems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hiba a bejelentések lekérésekor!" });
  }
});

// -------------------- DOLGOZÓ HOZZÁRENDELÉSE --------------------
router.post("/assignWorker", verifyFonok, async (req, res) => {
  const { problemId, workerId } = req.body;

  if (!problemId || !workerId) {
    return res.status(400).json({ error: "Hiányzó adatok!" });
  }

  try {
    const conn = await pool.getConnection();

    // Frissítés a problems táblában
    await conn.execute(
      `UPDATE problems SET assigned_to = ? , status='Folyamatban' WHERE problem_id = ?`,
      [workerId, problemId]
    );

    conn.release();
    res.json({ message: "✅ Dolgozó sikeresen hozzárendelve!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hiba a dolgozó hozzárendelésekor!" });
  }
});

export default router;
