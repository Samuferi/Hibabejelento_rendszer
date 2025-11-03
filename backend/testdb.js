import mysql from "mysql2/promise";

async function testDB() {
    try {
        const db = await mysql.createPool({
            host: "localhost",
            user: "root",
            password: "asd123",
            database: "hibabejelentes",
            port: 3306
        });

        const conn = await db.getConnection(); // itt db-t használunk
        console.log("✅ Sikeresen csatlakoztál az adatbázishoz!");
        const [rows] = await conn.query("SELECT * FROM users LIMIT 1;");
        console.log("Első user:", rows[0]);
        conn.release();
    } catch (err) {
        console.error("❌ Hiba az adatbázis csatlakozásnál:", err);
    }
}

testDB();

