import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import loginRoutes from "./login_t.js";  // ide húzzuk be a login route-okat
import indexRoutes from "./index_b.js";
import problemRoutes from "./ujprob_b.js";



// __dirname beállítása
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// statikus frontend kiszolgálás
app.use(express.static(path.join(__dirname, "../frontend")));

// feltöltött fájlok elérhetővé tétele
app.use("/uploads", express.static("uploads"));

// login route-ok
app.use("/", loginRoutes);

// probléma bejelentő route-ok
app.use("/", problemRoutes);

// index route-ok
app.use("/index", indexRoutes);

// szerver indítása
app.listen(3000, () => {
  console.log("✅ Server fut: http://localhost:3000/login");
});
