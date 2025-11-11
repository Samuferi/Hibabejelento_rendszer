import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import loginRoutes from "./login_t.js";  // ide húzzuk be a login route-okat
import indexRoutes from "./index_b.js";
import problemRoutes from "./korbej_b.js"; 
import newproblemRoutes from "./ujprob_b.js";
import profileRoutes from "./fiok_kez_b.js";
import adminRoutes from "./admin_kezeloi_felulet.js";
import fonokRoutes from "./fonok_felulet_b.js";
import munkatarsRoutes from "./munkatars_felulet_b.js";




// __dirname beállítása
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// feltöltött fájlok elérhetővé tétele
app.use("/uploads", express.static("uploads"));
console.log("Uploads path:", path.join(__dirname, "uploads"));



// statikus frontend kiszolgálás
app.use(express.static(path.join(__dirname, "../frontend")));


app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/signup.html"));
});

app.get("/index", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/index.html"));
});

app.get("/problems", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/kor_bej.html"));
});

app.get("/newproblems", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/uj_bej.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/fiok_kez.html"));
});

// login route-ok
app.use("/api", loginRoutes);
// probléma bejelentő route-ok
app.use("/api/problems", problemRoutes);
// index route-ok
app.use("/index", indexRoutes);
app.use("/api/newproblems", newproblemRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/fonok", fonokRoutes);
app.use("/api/munkatars", munkatarsRoutes);

// szerver indítása
app.listen(3000, () => {
  console.log("✅ Server fut: http://localhost:3000/login");
});
