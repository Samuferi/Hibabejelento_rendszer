import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import { JWT_SECRET } from './config.js';

const router = express.Router();

// 🔹 Adatbázis kapcsolat (igazítsd a saját configodhoz)
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

// 🔹 Új munkatárs felvétele (csak admin)
router.post("/newemployee", async (req, res) => {
  const { userf, userl, postcode, city, address, phone, email, password, status } = req.body;
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Nincs jogosultság!" });
  }
  try {
    // 🔸 1. Adatok ellenőrzése
    if (!userf || !userl || !email || !password || !status) {
      return res.status(400).json({ message: "Hiányzó kötelező adatok!" });
    }

    // 🔸 2. Email-ellenőrzés (ne legyen duplikált)
    const [existing] = await db.query("SELECT user_id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Ez az email-cím már használatban van!" });
    }

    // 🔸 3. Jelszó hashelése
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔸 4. Új felhasználó beszúrása
    await db.query(
      `INSERT INTO users 
        (vezeteknev, keresztnev, irsz, telepules, cim, telefon, email, jelszo_hash, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userl, userf, postcode || "", city || "", address || "", phone || "", email, hashedPassword, status]
    );

    res.status(201).json({ message: "Sikeres új munkatárs felvétele!" });

  } catch (err) {
    console.error("❌ Hiba az új munkatárs létrehozásakor:", err);
    res.status(500).json({ message: "Szerverhiba a tag felvételénél." });
  }
});


router.get("/allproblems", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Nincs jogosultság!" });
  }  
  
  try {
        const [rows] = await db.query(`
            SELECT p.problem_id, p.helyszin, p.idopont, p.kep_url, p.leiras, p.assigned_to, p.status, p.ugyfelszolg_megjegy, CONCAT(u.vezeteknev, ' ', u.keresztnev) AS user
            FROM problems p
            JOIN user_problems up ON up.problem_id = p.problem_id
            JOIN users u ON u.user_id = up.user_id
            ORDER BY p.idopont DESC
        `);

        res.json(rows);
    } catch (err) {
        console.error("Lekérdezési hiba:", err);
        res.status(500).json({ message: "Szerver hiba a problémák lekérésénél!" });
    }
});



router.get("/allemployees", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Nincs jogosultság!" });
  }
  try {
  
    const [rows] = await db.query(`
      SELECT 
        user_id AS id,
        vezeteknev AS lastname,
        keresztnev AS firstname,
        email,
        role AS status
      FROM users
      WHERE role IN ('admin', 'fonok', 'ugyintezo')
      ORDER BY user_id
    `);
    //console.log(rows);
    res.json(rows);
  } catch (err) {
    console.error("❌ Hiba a munkatársak lekérdezésekor:", err);
    res.status(500).json({ message: "Szerverhiba a munkatársak lekérésénél." });
  }
});


export default router;
