import express from "express";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import { JWT_SECRET } from './config.js';


const router = express.Router();

// 🔹 MySQL kapcsolat
const db = await mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Ocsi_2018',
  database: 'hibabejelento'
});


// 🔹 Middleware a token ellenőrzéséhez
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

// 🔹 /api/problems – lekérdezi az adott user bejelentéseit
router.get("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id; // tokenből jön

        // 🔸 SQL: kapcsolótáblán keresztül (user_problem)
        const [rows] = await db.query(`
            SELECT p.problem_id, p.helyszin, p.idopont, p.kep_url, p.leiras, p.assigned_to, p.status, CONCAT(u.vezeteknev, ' ', u.keresztnev) AS user
            FROM problems p
            JOIN user_problems up ON up.problem_id = p.problem_id
            JOIN users u ON u.user_id = up.user_id
            WHERE u.user_id = ?
            ORDER BY p.idopont DESC
        `, [userId]);

        res.json(rows);
    } catch (err) {
        console.error("Lekérdezési hiba:", err);
        res.status(500).json({ message: "Szerver hiba a problémák lekérésénél!" });
    }
});

export default router;
