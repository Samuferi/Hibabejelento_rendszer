
import express from "express";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";

const router = express.Router();
router.use("/uploads", express.static("uploads"));

// -------------------- ADATBÁZIS --------------------
const db = await mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Ocsi_2018',
  database: 'hibabejelento'
});

async function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Nincs token megadva!" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // ugyanaz a kulcs mint a login-nál
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Token hiba:", err);
        return res.status(403).json({ message: "Érvénytelen token!" });
    }
}

// -------------------- BEJELENTÉSEK LEKÉRÉSE --------------------
router.get("/problems", authenticateToken, async (req, res) => {
  try {
    const [problems] = await db.query(`
      SELECT p.problem_id, p.helyszin, p.kep_url, p.leiras, p.idopont, p.status
      FROM problems p
      WHERE p.status = "Felvéve"
      ORDER BY p.idopont DESC
    `);
    res.json(problems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hiba a bejelentések lekérésekor!" });
  }
});

// -------------------- DOLGOZÓK LEKÉRÉSE --------------------
router.get("/employees", authenticateToken, async (req, res) => {
  try {
    const [employees] = await db.query(`
      SELECT user_id, vezeteknev, keresztnev FROM users WHERE role='ugyintezo'
    `);
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hiba a dolgozók lekérésekor!" });
  }
});

// -------------------- DOLGOZÓ HOZZÁRENDELÉSE --------------------
router.post("/assignWorker", authenticateToken, async (req, res) => {
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

router.get("/activeProblems", authenticateToken, async (req, res) => {
  try {
    const [problems] = await db.query(`
      SELECT p.problem_id, p.helyszin, p.idopont, p.leiras, p.kep_url, p.assigned_to,  CONCAT(a.vezeteknev, ' ', a.keresztnev) AS assigned_name, p.status, CONCAT(u.vezeteknev, ' ', u.keresztnev) AS user
            FROM problems p
            JOIN user_problems up ON up.problem_id = p.problem_id
            JOIN users u ON u.user_id = up.user_id
            LEFT JOIN users a ON a.user_id = p.assigned_to
            WHERE p.status = "Folyamatban"
            ORDER BY p.idopont DESC
    `);
    res.json(problems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hiba a bejelentések lekérésekor!" });
  }
});

router.get("/resolvedProblems", authenticateToken, async (req, res) => {
  try {
    const [problems] = await db.query(`
      SELECT p.problem_id, p.helyszin, p.idopont, p.leiras, p.kep_url, p.assigned_to, p.ugyfelszolg_megjegy, CONCAT(a.vezeteknev, ' ', a.keresztnev) AS assigned_name, p.status, CONCAT(u.vezeteknev, ' ', u.keresztnev) AS user
            FROM problems p
            JOIN user_problems up ON up.problem_id = p.problem_id
            JOIN users u ON u.user_id = up.user_id
            LEFT JOIN users a ON a.user_id = p.assigned_to
            WHERE p.status = "Megoldva"
            ORDER BY p.idopont DESC
    `);
    res.json(problems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hiba a bejelentések lekérésekor!" });
  }
});

export default router;
