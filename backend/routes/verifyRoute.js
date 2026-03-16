const express = require("express");
const multer = require("multer");
const verifyController = require("../controllers/verifyController");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/verifyImage", upload.single("image"), verifyController.verifyImage);

module.exports = router;