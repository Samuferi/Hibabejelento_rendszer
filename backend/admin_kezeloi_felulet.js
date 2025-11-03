// -------------------- IMPORTOK --------------------
import express from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import { JWT_SECRET } from "./config.js";

const router = express.Router();

// -------------------- MULTER KONFIG --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // ide kerül a kép
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// -------------------- ADATBÁZIS --------------------
const db = await mysql.createPool({
            host: "localhost",
            user: "root",
            password: "asd123",
            database: "hibabejelentes",
            port: 3306
        });

// -------------------- TOKEN ELLENŐRZÉS --------------------
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ error: "Hiányzó token!" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Érvénytelen vagy lejárt token!" });
  }
}

// ============================================================
// 🟢 1️⃣ ÚJ PROBLÉMA LÉTREHOZÁSA  (lakos)
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  const { location, details, datetime } = req.body;
  const user_id = req.user.user_id;
  const kep_fajl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!location || !details) {
    return res.status(400).json({ error: "Hiányzó adatok!" });
  }

  try {
    const conn = await pool.getConnection();

    const [result] = await conn.execute(
      `INSERT INTO problems (helyszin, leiras, idopont, kep_url, status)
       VALUES (?, ?, ?, ?, 'Felvéve')`,
      [location, details, datetime || new Date(), kep_fajl]
    );

    const problem_id = result.insertId;

    // kapcsolótáblába mentés (lakos - probléma)
    await conn.execute(
      `INSERT INTO user_problems (user_id, problem_id) VALUES (?, ?)`,
      [user_id, problem_id]
    );

    conn.release();

    res.status(201).json({
      message: "Bejelentés sikeresen rögzítve!",
      problem_id,
      status: "Felvéve",
    });
  } catch (err) {
    console.error("Adatbázis hiba:", err);
    res.status(500).json({ error: "Szerverhiba a bejelentés mentésekor!" });
  }
});

// ============================================================
// 🟡 2️⃣ USER SAJÁT PROBLÉMÁINAK LEKÉRÉSE
router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [rows] = await pool.query(`
      SELECT p.problem_id, p.helyszin, p.idopont, p.kep_url, p.leiras, 
             p.assigned_to, p.status, p.ugyfelszolg_megjegy,
             CONCAT(u.vezeteknev, ' ', u.keresztnev) AS bejelento
      FROM problems p
      JOIN user_problems up ON up.problem_id = p.problem_id
      JOIN users u ON u.user_id = up.user_id
      WHERE u.user_id = ?
      ORDER BY p.idopont DESC
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error("Lekérdezési hiba:", err);
    res.status(500).json({ message: "Szerverhiba a problémák lekérésénél!" });
  }
});

// ============================================================
// 🔴 3️⃣ ADMIN / ÜGYINTÉZŐ – PROBLÉMA MÓDOSÍTÁS (állapot, hozzárendelés, megjegyzés)
router.put("/:id", verifyToken, async (req, res) => {
  const { role } = req.user;
  const { id } = req.params;
  const { status, assigned_to, ugyfelszolg_megjegy } = req.body;

  // Csak ügyintéző vagy admin módosíthat
  if (role !== "ugyintezo" && role !== "admin") {
    return res.status(403).json({ error: "Nincs jogosultság a módosításhoz!" });
  }

  try {
    const conn = await pool.getConnection();

    const [result] = await conn.execute(
      `UPDATE problems 
       SET status = COALESCE(?, status),
           assigned_to = COALESCE(?, assigned_to),
           ugyfelszolg_megjegy = COALESCE(?, ugyfelszolg_megjegy)
       WHERE problem_id = ?`,
      [status, assigned_to, ugyfelszolg_megjegy, id]
    );

    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Nincs ilyen bejelentés!" });
    }

    res.json({ message: "Bejelentés sikeresen frissítve!" });
  } catch (err) {
    console.error("Módosítási hiba:", err);
    res.status(500).json({ message: "Szerverhiba a módosítás során!" });
  }
});

// ============================================================

export default router;
