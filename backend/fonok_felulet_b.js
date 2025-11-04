
import express from "express";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";

const router = express.Router();

// -------------------- ADATBÁZIS --------------------
const db = await mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Ocsi_2018',
  database: 'hibabejelento'
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
    const [problems] = await db.query(`
      SELECT p.problem_id, p.helyszin, p.leiras, p.idopont, p.status
      FROM problems p
      ORDER BY p.idopont DESC
    `);
    res.json(problems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hiba a bejelentések lekérésekor!" });
  }
});

// -------------------- DOLGOZÓK LEKÉRÉSE --------------------
router.get("/employees", verifyFonok, async (req, res) => {
  try {
    const [employees] = await db.query(`
      SELECT user_id, vezeteknev, keresztnev FROM users WHERE role='munkatars'
    `);
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hiba a dolgozók lekérésekor!" });
  }
});

// -------------------- DOLGOZÓ HOZZÁRENDELÉSE --------------------
router.post("/assignWorker", verifyFonok, async (req, res) => {
  const { problemId, workerId } = req.body;

  if (!problemId || !workerId) {
    return res.status(400).json({ error: "Hiányzó adatok!" });
  }

  try {
    const conn = await db.getConnection();

    await conn.execute(
      `UPDATE problems SET assigned_to = ?, status = 'Folyamatban' WHERE problem_id = ?`,
      [workerId, problemId]
    );

    conn.release();
    res.json({ message: " Dolgozó sikeresen hozzárendelve!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hiba a dolgozó hozzárendelésekor!" });
  }
});

export default router;
