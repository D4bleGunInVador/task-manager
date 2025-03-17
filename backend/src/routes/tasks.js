const express = require("express");
const db = require("../models/db");
const authenticateToken = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Директорія для збереження фото

// 📌 Отримати всі задачі користувача
router.get("/", authenticateToken, (req, res) => {
    db.all("SELECT * FROM tasks WHERE user_id = ?", [req.user.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// 📌 Додати нову задачу з дедлайном
router.post("/", authenticateToken, (req, res) => {
    const { title, due_date } = req.body;
    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    db.run("INSERT INTO tasks (title, due_date, user_id) VALUES (?, ?, ?)", [title, due_date, req.user.id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, title, due_date, completed: false, user_id: req.user.id });
    });
});

// 📌 Оновити задачу (назва, статус, дедлайн)
router.put("/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    const { title, completed, due_date } = req.body;

    db.run(
        "UPDATE tasks SET title = ?, completed = ?, due_date = ? WHERE id = ? AND user_id = ?",
        [title, completed, due_date, id, req.user.id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(403).json({ error: "You can only update your own tasks." });
            }
            res.json({ message: "Task updated" });
        }
    );
});

// 📎 Додати фото до задачі
router.post("/upload/:id", authenticateToken, upload.single("image"), (req, res) => {
    const { id } = req.params;
    const imagePath = req.file.path;

    db.run(
        "UPDATE tasks SET image_path = ? WHERE id = ? AND user_id = ?",
        [imagePath, id, req.user.id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Image uploaded successfully", image_path: imagePath });
        }
    );
});

// 📌 Видалити задачу
router.delete("/:id", authenticateToken, (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM tasks WHERE id = ? AND user_id = ?", [id, req.user.id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(403).json({ error: "You can only delete your own tasks." });
        }
        res.json({ message: "Task deleted" });
    });
});

module.exports = router;
