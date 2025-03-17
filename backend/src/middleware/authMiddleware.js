const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

const authenticateToken = (req, res, next) => {
    if (process.env.NODE_ENV === "test") {
        console.log("🚀 TEST MODE - Authentication disabled");
        return next(); // ✅ Пропускаємо авторизацію
    }

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token." });
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
