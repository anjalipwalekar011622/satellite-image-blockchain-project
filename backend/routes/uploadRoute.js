const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/uploadController");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ===== ADMIN MIDDLEWARE =====
const ADMIN_PASSWORD = "admin123";

function isAdmin(req, res, next) {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey === ADMIN_PASSWORD) {
    next();
  } else {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
}

// ✅ Route name matches frontend: /api/uploadImage
router.post("/uploadImage", isAdmin, upload.single("image"), uploadController.uploadImage);

module.exports = router;