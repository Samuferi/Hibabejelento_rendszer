import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import { JWT_SECRET } from './config.js';

const router = express.Router();


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
        const decoded = jwt.verify(token, JWT_SECRET); 
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Token hiba:", err);
        return res.status(403).json({ message: "Érvénytelen token!" });
    }
}


router.post("/newemployee", authenticateToken, async (req, res) => {
  const { userf, userl, postcode, city, address, phone, email, password, status } = req.body;
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Nincs jogosultság!" });
  }
  try {
    
    if (!userf || !userl || !email || !password || !status) {
      return res.status(400).json({ message: "Hiányzó kötelező adatok!" });
    }

    
    const [existing] = await db.query("SELECT user_id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Ez az email-cím már használatban van!" });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
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
            SELECT p.problem_id, p.helyszin, p.idopont, p.leiras, p.kep_url, p.assigned_to, p.ugyfelszolg_megjegy, CONCAT(a.vezeteknev, ' ', a.keresztnev) AS assigned_name, p.status, CONCAT(u.vezeteknev, ' ', u.keresztnev) AS user
            FROM problems p
            JOIN user_problems up ON up.problem_id = p.problem_id
            JOIN users u ON u.user_id = up.user_id
            LEFT JOIN users a ON a.user_id = p.assigned_to
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
      ORDER BY vezeteknev ASC;
    `);
    //console.log(rows);
    res.json(rows);
  } catch (err) {
    console.error("❌ Hiba a munkatársak lekérdezésekor:", err);
    res.status(500).json({ message: "Szerverhiba a munkatársak lekérésénél." });
  }
});


router.get("/users", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Nincs jogosultság!" });
  }
  try {
  
    const [rows] = await db.query(`
      SELECT 
        user_id AS id,
        vezeteknev,
        keresztnev,
        email,
        irsz,
        telepules,
        cim,
        telefon,
        role AS status
      FROM users
      WHERE role IN ('lakos')
      ORDER BY vezeteknev ASC;
    `);
    //console.log(rows);
    res.json(rows);
  } catch (err) {
    console.error("❌ Hiba a munkatársak lekérdezésekor:", err);
    res.status(500).json({ message: "Szerverhiba a munkatársak lekérésénél." });
  }
});

router.delete("/users/:id", authenticateToken, async (req, res) => {
  const userId = req.params.id;
  try {
    await db.query("DELETE FROM users WHERE user_id = ?", [userId]);
    res.status(200).json({ message: "Felhasználó sikeresen törölve." });
  } catch (err) {
    console.error("❌ Hiba a felhasználó törlésekor:", err);
    res.status(500).json({ message: "Szerverhiba a felhasználó törlésekor." });
  }
});

router.delete("/allemployees/:id", authenticateToken, async (req, res) => {
  const userId = req.params.id;
  try {
    await db.query("DELETE FROM users WHERE user_id = ?", [userId]);
    res.status(200).json({ message: "Munkatárs sikeresen törölve." });
  } catch (err) {
    console.error("❌ Hiba a munkatárs törlésekor:", err);
    res.status(500).json({ message: "Szerverhiba a munkatárs törlésekor." });
  }
});


export default router;
