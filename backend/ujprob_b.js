import express from "express";
import mysql from "mysql2/promise";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// ESM miatt __dirname pótlás
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// ---- MySQL pool (ehhez a DB-hez csatlakozunk) ----
const db = await mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Ocsi_2018',
  database: 'hibabejelento'
});

router.get("/problem", (req, res) => {
  res.sendFile(path.join(__dirname, "../front/ujprob.html"));
});

// ---- Multer fájl feltöltés beállítás ----
const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ---- Új probléma felvétele ----
router.post("/", upload.single("images"), async (req, res) => {
  try {
    const { user_id, location, datetime, details } = req.body;
    const file = req.file;

    // Mentjük az elérési utat, ha van kép
    const imagePath = file ? `/uploads/${file.filename}` : null;

    // 1) Probléma beszúrása
    const [result] = await db.query(
      `INSERT INTO problems (helyszin, idopont, kep_url, leiras) 
       VALUES (?, ?, ?, ?)`,
      [location, datetime, imagePath, details]
    );

    const problemId = result.insertId;

    // 2) Kapcsolat a user_problems táblába
    await db.query(
      `INSERT INTO user_problems (user_id, problem_id) VALUES (?, ?)`,
      [user_id, problemId]
    );

    res.json({
      message: "Hiba sikeresen rögzítve",
      problemId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Szerver hiba a probléma rögzítésekor" });
  }
});

export default router;
