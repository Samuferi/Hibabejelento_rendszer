// -------------------- IMPORTOK --------------------
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import multer from "multer";
import { JWT_SECRET } from './config.js';

const router = express.Router();

// -------------------- MULTER KONFIG --------------------
// ide kerülnek majd a feltöltött képek (pl. /uploads mappába)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// -------------------- ADATBÁZIS --------------------
const db = await mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Ocsi_2018',
  database: 'hibabejelento'
});
// -------------------- APP ALAP --------------------
const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // képek elérhetőek lesznek URL-en

// -------------------- TOKEN ELLENŐRZÉS --------------------
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Hiányzó token!" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Érvénytelen vagy lejárt token!" });
  }
}

// -------------------- ÚJ PROBLÉMA FELVÉTEL --------------------
// fájlfeltöltés + token ellenőrzés
router.post("/", verifyToken, upload.single("images"), async (req, res) => {
  //console.log("📸 Fájl:", req.file);
  //console.log("📋 Body:", req.body);
  
  const { location, details, datetime } = req.body;
  const user_id = req.user.user_id; // tokenből jön
  const kep_fajl = req.file ? `/uploads/${req.file.filename}` : null;


  if (!location || !details || !datetime) {
    return res.status(400).json({ error: "Hiányzó adatok!" });
  }

  try {
    

    const [result] = await db.query(
      `INSERT INTO problems (helyszin, leiras, idopont, kep_url, status)
       VALUES (?, ?, ?, ?, 'Felvéve')`,
      [location, details, datetime, kep_fajl]
    );

    const problem_id = result.insertId;

    await db.query(
      `INSERT INTO user_problems (user_id, problem_id) VALUES (?, ?)`,
      [user_id, problem_id]
    );


    res.status(201).json({
      message: "Bejelentés sikeresen rögzítve!",
      problem_id: problem_id,
      status: "Felvéve",
      kep: kep_fajl,
    });
  } catch (err) {
    console.error("Adatbázis hiba:", err);
    res.status(500).json({ error: "Szerverhiba a bejelentés mentésekor!" });
  }
});

export default router;
