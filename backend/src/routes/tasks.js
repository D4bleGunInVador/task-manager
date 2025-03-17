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
            console.error("❌ DB Error (GET /tasks):", err.message);
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

    db.run(
        "INSERT INTO tasks (title, due_date, user_id) VALUES (?, ?, ?)",
        [title, due_date || null, req.user.id],
        function (err) {
            if (err) {
                console.error("❌ DB Error (POST /tasks):", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                id: this.lastID,
                title,
                due_date: due_date || null,
                completed: false,
                user_id: req.user.id,
                image_path: null,
            });
        }
    );
});


// 📌 Оновити задачу (назва, статус, дедлайн)
router.put("/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    const { title, completed, due_date } = req.body;

    db.get("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [id, req.user.id], (err, task) => {
        if (err) {
            console.error("❌ DB Error (PUT /tasks):", err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!task) {
            return res.status(404).json({ error: "Task not found or access denied" });
        }

        db.run(
            "UPDATE tasks SET title = ?, completed = ?, due_date = ? WHERE id = ?",
            [title || task.title, completed ?? task.completed, due_date || task.due_date, id],
            function (err) {
                if (err) {
                    console.error("❌ DB Error (UPDATE /tasks):", err.message);
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: "Task updated", id, title, completed, due_date });
            }
        );
    });
});

// 📎 Додати фото до задачі
router.post("/upload/:id", authenticateToken, upload.single("image"), (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
    }
    const imagePath = req.file.path;

    db.run(
        "UPDATE tasks SET image_path = ? WHERE id = ? AND user_id = ?",
        [imagePath, id, req.user.id],
        function (err) {
            if (err) {
                console.error("❌ DB Error (UPLOAD /tasks):", err.message);
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
            console.error("❌ DB Error (DELETE /tasks):", err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(403).json({ error: "You can only delete your own tasks." });
        }
        res.json({ message: "Task deleted successfully" });
    });
});

module.exports = router;
