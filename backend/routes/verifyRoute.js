const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyController = require("../controllers/verifyController");

// 🔥 multer config (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 🔹 Verify route
router.post("/verifyImage", upload.single("image"), verifyController.verifyImage);

module.exports = router;