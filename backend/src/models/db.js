const sqlite3 = require("sqlite3").verbose();
const DB_FILE = process.env.NODE_ENV === "test" ? "./test.sqlite" : "./database.sqlite";

// Підключення до бази даних
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error("❌ Database connection error:", err.message);
    } else {
        console.log(`✅ Connected to SQLite database: ${DB_FILE}`);
    }
});

// Створення таблиць, якщо вони не існують
db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            last_active DATETIME DEFAULT NULL
        )`,
        (err) => {
            if (err) console.error("❌ Error creating users table:", err.message);
            else console.log("✅ Users table is ready.");
        }
    );

    db.run(
        `CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            completed BOOLEAN DEFAULT 0,
            due_date TEXT, -- Дата завершення задачі
            image_path TEXT, -- Шлях до прикріпленого фото
            user_id INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,
        (err) => {
            if (err) console.error("❌ Error creating tasks table:", err.message);
            else console.log("✅ Tasks table is ready.");
        }
    );
});

// Експортуємо базу даних
module.exports = db;
