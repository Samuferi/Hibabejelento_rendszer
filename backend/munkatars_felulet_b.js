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
};

router.get("/allproblems", authenticateToken, async (req, res) => {
   try {
        const workerId = req.user.id;

        const [rows] = await db.query(`
            SELECT p.problem_id, p.helyszin, p.idopont, p.leiras, p.kep_url, p.assigned_to, p.ugyfelszolg_megjegy, p.status, CONCAT(u.vezeteknev, ' ', u.keresztnev) AS user 
            FROM problems p
            JOIN user_problems up ON up.problem_id = p.problem_id
            JOIN users u ON u.user_id = up.user_id
            WHERE assigned_to = ?
        `, [workerId]);

        res.json(rows);
    } catch (error) {
        console.error("❌ Hiba az új problémák lekérésénél:", error);
        res.status(500).json({ message: "Szerver hiba!" });
    }
});

router.post("/assignproblems", authenticateToken, async (req, res) => {
     try {
        const workerId = req.user.id;
        const { problemId, status, comment } = req.body;

        if (!problemId || !status) {
            return res.status(400).json({ message: "Hiányzó adatok!" });
        }

        
        const [check] = await db.query(
            "SELECT assigned_to FROM problems WHERE id = ?",
            [problemId]
        );

        if (!check.length || check[0].assigned_to !== workerId) {
            return res.status(403).json({ message: "Nincs jogosultság ehhez a feladathoz!" });
        }

        await db.query(
            "UPDATE problems SET status = ?, ugyfelszolg_megjegy = ? WHERE id = ?",
            [status, comment || "", problemId]
        );

        res.json({ message: "✅ Sikeres frissítés!" });
    } catch (error) {
        console.error("❌ Hiba a státusz frissítésnél:", error);
        res.status(500).json({ message: "Szerver hiba!" });
    }
});

export default router;