import express from "express";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import mysql from "mysql2/promise";



const router = express.Router();

const db = await mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Ocsi_2018',
  database: 'hibabejelento'
});

// Új jelszó generálása
function generatePassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
}

// Nodemailer transporter -- Gmail példával
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "it.hibabejelento@gmail.com",
        pass: "gqpm fuwk scmz crbu"   // Gmail app-hoz generált jelszó!
    }
});

router.post("/", async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ msg: "Email kötelező!" });

    try {
        // Nézzük meg létezik-e user
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (rows.length === 0) {
            return res.status(404).json({ msg: "Ilyen email cím nincs regisztrálva!" });
        }

        // Generálunk új jelszót
        const newPassword = generatePassword();
        const hash = await bcrypt.hash(newPassword, 10);

        // Adatbázis update
        await db.query("UPDATE users SET jelszo_hash = ? WHERE email = ?", [hash, email]);

        await db.query(`INSERT INTO password_reset (email, datum, user_id, hash_jelszo_gen) VALUES (?, NOW(), ?, ?)`,
            [email, rows[0].user_id, hash]);
        // E-mail küldése
        const mailOptions = {
            from: "Hibabejelentő rendszer <it.hibabejelento@gmail.com>",
            to: email,
            subject: "Új jelszó a Hibabejelentő rendszerhez",
            html: `
                <h3>Új jelszó</h3>
                <p>A rendszer új jelszót generált számodra:</p>
                <p><b>${newPassword}</b></p>
                <p>Kérjük, mihamarabb változtasd meg a profilodban!</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ msg: "Új jelszó elküldve az email címre!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Szerver hiba" });
    }
});

export default router;
