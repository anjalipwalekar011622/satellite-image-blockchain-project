const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/uploadController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/uploadImage",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  uploadController.uploadImage
);

module.exports = router;
