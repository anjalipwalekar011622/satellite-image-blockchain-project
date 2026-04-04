const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyController = require("../controllers/verifyController");
const blockchainService = require("../services/blockchainService");
const { generateGeohash } = require("../services/geohashService");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Verify route
router.post("/verifyImage", upload.single("image"), verifyController.verifyImage);

// ✅ Search by location route
router.get("/search", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "lat and lng are required" });
    }

    // Step 1: Convert lat/lng to geohash
    // Using generateGeohash — same function your backend already uses
    const geoHash = generateGeohash(parseFloat(lat), parseFloat(lng));
    console.log("Searching for geohash:", geoHash);

    // Step 2: Get images from blockchain by geohash
    // getImagesByGeohash now returns full image objects directly
    const images = await blockchainService.getImagesByGeohash(geoHash);
    console.log("Images found:", images.length);

    if (!images || images.length === 0) {
      return res.json({
        geohash: geoHash,
        images: [],
        message: "No images found at this location",
      });
    }

    res.json({ geohash: geoHash, images });

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed", details: error.message });
  }
});

module.exports = router;