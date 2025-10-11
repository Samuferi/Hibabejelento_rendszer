import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { JWT_SECRET } from './config.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = await mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Ocsi_2018',
  database: 'hibabejelento'
});





// 🔹 REGISZTRÁCIÓ
router.post('/register', async (req, res) => {
  console.log("Kapott adatok:", req.body);
  try {
    const { lastname, firstname, email, "post-number": irsz, town: telepules, address: cim, "phone-number": telefon, password } = req.body;

    if (!lastname || !firstname || !email || !irsz || !telepules || !cim || !telefon || !password) {
      return res.status(400).json({ message: 'Minden mező kitöltése kötelező' });
    }

    const [rows] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'Ezzel az e-mail címmel már regisztráltak' });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (vezeteknev, keresztnev, email, irsz, telepules, cim, telefon, jelszo_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [lastname, firstname, email, irsz, telepules, cim, telefon, hashed, 'lakos']
    );

    res.json({ message: 'Sikeres regisztráció' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Szerver hiba' });
  }
});

// 🔹 BEJELENTKEZÉS
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Hibás e-mail vagy jelszó' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.jelszo_hash);
    if (!match) {
      return res.status(400).json({ message: 'Hibás e-mail vagy jelszó' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        vezeteknev: user.vezeteknev,
        keresztnev: user.keresztnev,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Szerver hiba' });
  }
});

export default router;
