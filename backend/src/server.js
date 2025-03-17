require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let onlineUsers = new Map(); 

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register-user", (userEmail) => {
        if (userEmail) {
            onlineUsers.set(socket.id, userEmail); 
            io.emit("online-users", Array.from(onlineUsers.values())); // Відправляємо список email'ів
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        onlineUsers.delete(socket.id);
        io.emit("online-users", Array.from(onlineUsers.values()));
    });
});

// Запускаємо сервер
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}


app.use(express.json());
app.use(cors());

// Підключаємо маршрути
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const authenticateToken = require("./middleware/authMiddleware"); // Імпортуємо Middleware

app.use("/auth", authRoutes);
app.use("/tasks", authenticateToken, taskRoutes); 

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

module.exports = app;
