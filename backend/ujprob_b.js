// -------------------- IMPORTOK --------------------
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import multer from "multer";

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
const pool = mysql.createPool({
  host: "localhost",         // 👉 a te adatbázisod host-ja (pl. localhost)
  user: "root",              // 👉 a saját MySQL felhasználód
  password: "asd123",  // 👉 a saját MySQL jelszavad
  database: "varosihibabejelento", // 👉 az adatbázis neve
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
    const decoded = jwt.verify(token, "titkoskulcsod"); // 👉 használd ugyanazt, mint a login-nál
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Érvénytelen vagy lejárt token!" });
  }
}

// -------------------- ÚJ PROBLÉMA FELVÉTEL --------------------
// fájlfeltöltés + token ellenőrzés
app.post("/api/uj-problema", verifyToken, upload.single("kep"), async (req, res) => {
  const { helyszin, leiras } = req.body;
  const user_id = req.user.user_id; // tokenből jön
  const kep_fajl = req.file ? req.file.path : null;

  if (!helyszin || !leiras) {
    return res.status(400).json({ error: "Hiányzó adatok!" });
  }

  try {
    const conn = await pool.getConnection();

    const [result] = await conn.execute(
      `INSERT INTO problems (helyszin, leiras, kep_url, status)
       VALUES (?, ?, ?, 'Felvéve')`,
      [helyszin, leiras, kep_fajl]
    );

    const problem_id = result.insertId;

    await conn.execute(
      `INSERT INTO user_problems (user_id, problem_id) VALUES (?, ?)`,
      [user_id, problem_id]
    );

    conn.release();

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

// -------------------- SZERVER INDÍTÁS --------------------
app.listen(3000, () => console.log("✅ Backend fut a 3000-es porton"));
