// server.js - egyfájlos Express backend (MySQL, JWT auth, admin CRUD)
// Telepítés: npm install express mysql2 bcrypt jsonwebtoken cors dotenv
// Indítás: node server.js

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ======= Konfiguráció (ENV vagy alapértelmezett) =======
const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';          // állítsd be .env-ben ha kell
const DB_NAME = process.env.DB_NAME || 'hibabejelento';
const JWT_SECRET = process.env.JWT_SECRET || 'valami_szupertitkos';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

// ======= MySQL pool =======
let pool;
async function initDb() {
  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true
  });
  // egyszerű ellenőrzés
  await pool.query('SELECT 1');
  console.log('Connected to MySQL:', DB_HOST, DB_NAME);
}

// ======= Auth middleware =======
async function authenticateToken(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'No token provided' });
  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // csatoljuk a user_id + role-t a req-hez (később szükséges)
    req.user = { user_id: payload.user_id, role: payload.role };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

// ======= Auth endpoints =======
// Register
app.post('/api/auth/register', async (req, res) => {
  const { vezeteknev, keresztnev, email, irsz, telepules, cim, telefon, password } = req.body;
  if (!vezeteknev || !keresztnev || !email || !password) {
    return res.status(400).json({ error: 'Hiányzó adatok (vezetéknév, keresztnév, email, password kötelező)' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (vezeteknev, keresztnev, email, irsz, telepules, cim, telefon, jelszo_hash) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [vezeteknev, keresztnev, email, irsz || null, telepules || null, cim || null, telefon || null, hash]
    );
    return res.status(201).json({ message: 'Sikeres regisztráció', user_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email már foglalt' });
    console.error(err);
    return res.status(500).json({ error: 'Szerverhiba', details: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Hiányzó email vagy password' });
  try {
    const [rows] = await pool.query('SELECT user_id, email, jelszo_hash, role FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Hibás email/jelszó' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.jelszo_hash);
    if (!ok) return res.status(401).json({ error: 'Hibás email/jelszó' });

    const token = jwt.sign({ user_id: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.json({ token, user: { user_id: user.user_id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Szerverhiba' });
  }
});

// ======= Admin: felhasználó kezelések =======
// Listázás (admin)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id, vezeteknev, keresztnev, email, irsz, telepules, cim, telefon, role FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Új user létrehozása admin által
app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  const { vezeteknev, keresztnev, email, irsz, telepules, cim, telefon, password, role } = req.body;
  if (!vezeteknev || !keresztnev || !email || !password || !role) {
    return res.status(400).json({ error: 'Hiányzó adatok (veznév, keresztnév, email, password, role szükséges)' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (vezeteknev, keresztnev, email, irsz, telepules, cim, telefon, jelszo_hash, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vezeteknev, keresztnev, email, irsz || null, telepules || null, cim || null, telefon || null, hash, role]
    );
    res.status(201).json({ message: 'User létrehozva', user_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email már foglalt' });
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Módosítás (admin)
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const id = req.params.id;
  const { vezeteknev, keresztnev, email, irsz, telepules, cim, telefon, password, role } = req.body;
  try {
    const updates = [];
    const params = [];
    if (vezeteknev !== undefined) { updates.push('vezeteknev = ?'); params.push(vezeteknev); }
    if (keresztnev !== undefined) { updates.push('keresztnev = ?'); params.push(keresztnev); }
    if (email !== undefined) { updates.push('email = ?'); params.push(email); }
    if (irsz !== undefined) { updates.push('irsz = ?'); params.push(irsz); }
    if (telepules !== undefined) { updates.push('telepules = ?'); params.push(telepules); }
    if (cim !== undefined) { updates.push('cim = ?'); params.push(cim); }
    if (telefon !== undefined) { updates.push('telefon = ?'); params.push(telefon); }
    if (role !== undefined) { updates.push('role = ?'); params.push(role); }
    if (password !== undefined) {
      const hash = await bcrypt.hash(password, 10);
      updates.push('jelszo_hash = ?'); params.push(hash);
    }
    if (!updates.length) return res.status(400).json({ error: 'Nincs frissítendő mező' });

    params.push(id);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`;
    const [r] = await pool.query(sql, params);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Nem található user' });
    res.json({ message: 'Frissítve' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Törlés (admin)
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const id = req.params.id;
  try {
    const [r] = await pool.query('DELETE FROM users WHERE user_id = ?', [id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Nem található user' });
    res.json({ message: 'Törölve' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ======= Problems =======
// Új probléma: bejelentett user köthető a kapcsoló táblához
app.post('/api/problems', authenticateToken, async (req, res) => {
  const { helyszin, kep_url, leiras } = req.body;
  if (!helyszin) return res.status(400).json({ error: 'helyszin szükséges' });
  try {
    const [r] = await pool.query(
      'INSERT INTO problems (helyszin, kep_url, leiras) VALUES (?, ?, ?)',
      [helyszin, kep_url || null, leiras || null]
    );
    const problemId = r.insertId;
    await pool.query('INSERT INTO user_problems (user_id, problem_id) VALUES (?, ?)', [req.user.user_id, problemId]);
    res.status(201).json({ message: 'Bejelentés rögzítve', problem_id: problemId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Saját bejelentések lekérdezése
app.get('/api/problems/mine', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.* FROM problems p
       JOIN user_problems up ON p.problem_id = up.problem_id
       WHERE up.user_id = ? ORDER BY p.idopont DESC`,
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Admin/ügyintéző: összes bejelentés
app.get('/api/problems', authenticateToken, async (req, res) => {
  // admin és ugyintezo látja
  if (!['admin','ugyintezo'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const [rows] = await pool.query('SELECT * FROM problems ORDER BY idopont DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Státusz / assigned módosítása (admin/ügyintéző)
app.put('/api/problems/:id', authenticateToken, async (req, res) => {
  if (!['admin','ugyintezo'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  const id = req.params.id;
  const { status, assigned_to } = req.body;
  try {
    const updates = [];
    const params = [];
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (assigned_to !== undefined) { updates.push('assigned_to = ?'); params.push(assigned_to); }
    if (!updates.length) return res.status(400).json({ error: 'Nincs frissítendő mező' });
    params.push(id);
    const sql = `UPDATE problems SET ${updates.join(', ')} WHERE problem_id = ?`;
    const [r] = await pool.query(sql, params);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Nincs ilyen bejelentés' });
    res.json({ message: 'Frissítve' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ======= Messages =======
// Új üzenet
app.post('/api/messages', authenticateToken, async (req, res) => {
  const { cimzett_id, targy, uzenet } = req.body;
  if (!cimzett_id || !uzenet) return res.status(400).json({ error: 'Hiányzó cimzett vagy üzenet' });
  try {
    const [r] = await pool.query(
      'INSERT INTO messages (kuldo_id, cimzett_id, targy, uzenet) VALUES (?, ?, ?, ?)',
      [req.user.user_id, cimzett_id, targy || null, uzenet]
    );
    res.status(201).json({ message: 'Üzenet elküldve', message_id: r.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Inbox (bejövő üzenetek)
app.get('/api/messages/inbox', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM messages WHERE cimzett_id = ? ORDER BY kuldes_ideje DESC', [req.user.user_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Olvasottság jelölése
app.put('/api/messages/:id/read', authenticateToken, async (req, res) => {
  const id = req.params.id;
  try {
    const [r] = await pool.query('UPDATE messages SET olvasva = TRUE WHERE message_id = ? AND cimzett_id = ?', [id, req.user.user_id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Nincs ilyen üzenet vagy nincs jogosultság' });
    res.json({ message: 'Jelölve olvasottnak' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ======= News =======
// Listázás
app.get('/api/news', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM news ORDER BY datum DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: új hír
app.post('/api/news', authenticateToken, requireAdmin, async (req, res) => {
  const { cim, tartalom } = req.body;
  if (!cim || !tartalom) return res.status(400).json({ error: 'Hiányzó cim vagy tartalom' });
  try {
    const [r] = await pool.query('INSERT INTO news (cim, tartalom) VALUES (?, ?)', [cim, tartalom]);
    res.status(201).json({ message: 'Hír létrehozva', news_id: r.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ======= Indítás =======
(async () => {
  try {
    await initDb();
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
