import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import { JWT_SECRET } from "./config.js";

const router = express.Router();

const db = await mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Ocsi_2018',
  database: 'hibabejelento'
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Hiányzó token!" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Érvénytelen token!" });
    req.user = user; 
    next();
  });
}


router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const {
      userf, userl, postcode, city, address,
      email, phone, currentPassword, newPassword
    } = req.body;

   
    const updates = [];
    const params = [];

    if (userf) { updates.push("keresztnev = ?"); params.push(userf); }
    if (userl) { updates.push("vezeteknev = ?"); params.push(userl); }
    if (postcode) { updates.push("irsz = ?"); params.push(postcode); }
    if (city) { updates.push("telepules = ?"); params.push(city); }
    if (address) { updates.push("cim = ?"); params.push(address); }
    if (email) { updates.push("email = ?"); params.push(email); }
    if (phone) { updates.push("telefon = ?"); params.push(phone); }

    
    if (currentPassword && newPassword) {
      const [rows] = await db.query("SELECT jelszo_hash FROM users WHERE user_id = ?", [userId]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "Felhasználó nem található!" });
      }

      const validPass = await bcrypt.compare(currentPassword, rows[0].jelszo_hash);
      if (!validPass) {
        return res.status(400).json({ message: "Hibás jelenlegi jelszó!" });
      }

      const hashedNew = await bcrypt.hash(newPassword, 10);
      updates.push("jelszo_hash = ?");
      params.push(hashedNew);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "Nincs megadva módosítandó adat!" });
    }

    
    const sql = `UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`;
    params.push(userId);

    await db.query(sql, params);

    return res.json({ message: "✅ Sikeres módosítás!" });

  } catch (err) {
    console.error("❌ Profil módosítási hiba:", err);
    res.status(500).json({ message: "Szerverhiba a profil módosításakor!" });
  }
});

export default router;
