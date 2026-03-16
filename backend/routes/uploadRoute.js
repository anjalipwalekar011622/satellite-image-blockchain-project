const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/uploadController");

const router = express.Router();

// store uploaded file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/uploadImage
router.post("/uploadImage", upload.single("image"), uploadController.uploadImage);

module.exports = router;