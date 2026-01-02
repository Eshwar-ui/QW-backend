const jwt = require("jsonwebtoken");
require("dotenv").config(); // Ensure env vars are loaded

module.exports = function(req, res, next) {
    try {
        // Get the token from the Authorization header
        let authHeader = req.header("Authorization");
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Authentication required. Please provide a valid authorization token." });
        }

        // Extract the token from the Authorization header
        let token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Authentication token is missing. Please provide a valid token." });
        }

        const jwtSecret = process.env.JWT_SECRET || "jwtPassword";
        let compareToken = jwt.verify(token, jwtSecret);
        req.employeeId = compareToken.employeeId; // comparing requested user and logged in user
        next();
    } catch (e) {
        console.error("JWT authentication failed:", e);
        if (e.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Your session has expired. Please log in again." });
        }
        if (e.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Invalid authentication token. Please log in again." });
        }
        return res.status(500).json({ error: "Authentication error. Please try again later." });
    }
};