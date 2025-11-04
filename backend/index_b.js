// index_b.js
import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET} from "./config.js";

const router = express.Router();


// Middleware: token ellenőrzés
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    //console.log("Kapott Authorization header:", authHeader);
    //console.log("Kivágott token:", token); 

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
  // Frontend fogja betölteni az admin.html-t
  res.status(200).json({ message: "Jogosultság rendben" });
});

router.get("/fonok", authenticateToken, (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "fonok") {
    return res.status(403).json({ message: "Nincs jogosultság!" });
  }
  // Frontend fogja betölteni az fonok.html-t
  res.status(200).json({ message: "Jogosultság rendben" });
});
export default router;
