// index_b.js
import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import { JWT_SECRET} from "./config.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Middleware: token ellenőrzés
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    //console.log("Kapott Authorization header:", authHeader);

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // JWT payload (id, email, role, stb.)
        next();
    });
}

// Csak belépett user elérése
router.get("/user", authenticateToken, (req, res) => {
    res.json({
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
    });
});

// Admin-only endpoint
router.get("/admin", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Nincs jogosultság!" });
  }
  res.status(200).json({ message: "Üdvözlünk az admin felületen!" });
});

router.get("/fonok", authenticateToken, (req, res) => {
  if (req.user.role !== "fonok" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Nincs jogosultság!" });
  }
  // Frontend fogja betölteni az fonok.html-t
  res.status(200).json({ message: "Üdvözlünk az vezetői felületen!" });
});

router.get("/munkatars", authenticateToken, (req, res) => {
  if (req.user.role !== "ugyintezo" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Nincs jogosultság!" });
  }
  // Frontend fogja betölteni az munkatars.html-t
  res.status(200).json({ message: "Üdvözlünk az munkatárs felületen!" });
});

router.get("/uj_hir", authenticateToken, (req, res) => {
  if (req.user.role !== "fonok" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Nincs jogosultság!" });
  }
  
  res.status(200).json({ message: "Üdvözlünk az új hír felvétele felüleleten!" });
});

export default router;