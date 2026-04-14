const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const { db, hasAdminUser, findUserByUsername, getUsersForAdmin } = require("../services/databaseService");

const router = express.Router();

router.get("/setup-status", (req, res) => {
  res.json({ hasAdmin: hasAdminUser() });
});

router.post("/setup-admin", (req, res) => {
  try {
    if (hasAdminUser()) return res.status(403).json({ error: "Admin already exists" });

    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const passwordHash = bcrypt.hashSync(password, 10);
    db.prepare(`
      INSERT INTO users (username, password_hash, role, created_at)
      VALUES (?, ?, 'admin', ?)
    `).run(username, passwordHash, new Date().toISOString());

    res.json({ message: "Admin account created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Admin setup failed", details: error.message });
  }
});

router.post("/register", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    if (findUserByUsername(username)) return res.status(409).json({ error: "Username already exists" });

    const passwordHash = bcrypt.hashSync(password, 10);
    db.prepare(`
      INSERT INTO users (username, password_hash, role, created_at)
      VALUES (?, ?, 'user', ?)
    `).run(username, passwordHash, new Date().toISOString());

    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
});

router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;
    const user = findUserByUsername(username);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

router.get("/admin/users", requireAuth, requireAdmin, (req, res) => {
  res.json({ users: getUsersForAdmin() });
});

module.exports = router;
