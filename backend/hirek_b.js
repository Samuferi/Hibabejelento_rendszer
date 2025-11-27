import express from "express";
import jwt from "jsonwebtoken";
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

router.get("/", authenticateToken, async (req, res) => {
    try {
        

        const [rows] = await db.query(`
            SELECT cim, datum, tartalom, kep_url FROM news
            ORDER BY datum DESC
        `);

        res.json(rows);
    } catch (err) {
        console.error("Lekérdezési hiba:", err);
        res.status(500).json({ message: "Szerver hiba a problémák lekérésénél!" });
    }
});

export default router;
