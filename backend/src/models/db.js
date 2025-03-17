const sqlite3 = require("sqlite3").verbose();

// 📌 Визначаємо, яку базу використовувати
const dbFile = process.env.NODE_ENV === "test" ? "./test.sqlite" : "./database.sqlite";
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error("❌ Database connection error:", err.message);
    } else {
        console.log(`✅ Connected to SQLite database: ${dbFile}`);
    }
});

// 📌 Створення таблиць, якщо вони не існують
db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            last_active DATETIME DEFAULT NULL
        )`
    );

    db.run(
        `CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            due_date TEXT DEFAULT NULL,
            completed BOOLEAN DEFAULT 0,
            user_id INTEGER NOT NULL,
            image_path TEXT DEFAULT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    );
});

module.exports = db;
