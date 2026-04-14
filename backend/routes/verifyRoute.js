const express = require("express");
const router = express.Router();
const multer = require("multer");
const hashService = require("../services/hashService");
const verifyController = require("../controllers/verifyController");
const blockchainService = require("../services/blockchainService");
const { generateGeohash } = require("../services/geohashService");
const { optionalAuth, requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const {
  findImagesByGeohash,
  findImageByHash,
  getImageHistory,
  getImageAnalytics,
  getUsersForAdmin,
  insertUserActivity,
  getUserActivity,
  getUserAnalytics
} = require("../services/databaseService");

const storage = multer.memoryStorage();
const upload = multer({ storage });

function toPublicImage(img) {
  return {
    id: img.id,
    cid: img.cid,
    geohash: img.geohash,
    latitude: img.latitude,
    longitude: img.longitude,
    placeName: img.place_name || img.placeName || "",
    imageType: img.image_type || img.imageType || "Satellite Image",
    filename: img.filename || "",
    uploadedAt: img.uploaded_at || img.uploadedAt || "",
    ipfsUrl: img.ipfsUrl || `https://gateway.pinata.cloud/ipfs/${img.cid}`
  };
}

function toAdminImage(img) {
  return {
    id: img.id,
    cid: img.cid,
    hash: img.hash,
    geohash: img.geohash,
    latitude: img.latitude,
    longitude: img.longitude,
    placeName: img.place_name || img.placeName || "",
    imageType: img.image_type || img.imageType || "Satellite Image",
    filename: img.filename || "",
    txHash: img.tx_hash || img.txHash || "",
    uploadedAt: img.uploaded_at || img.uploadedAt || "",
    isAdminOnly: img.is_admin_only,
    integrityToken: img.integrity_token || "",
    ecdsaSignature: img.ecdsa_signature || "",
    signerAddress: img.signer_address || "",
    timestamp: img.timestamp || null,
    uploader: img.uploader || "",
    ipfsUrl: img.ipfsUrl || `https://gateway.pinata.cloud/ipfs/${img.cid}`
  };
}

router.post("/verifyImage", optionalAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const newHash = hashService.generateHash(req.file.buffer);
    console.log("Incoming hash:", newHash);

    let matchedImage = findImageByHash(newHash);
    let isAuthentic = !!matchedImage;

    if (!isAuthentic) {
      try {
        isAuthentic = await blockchainService.verifyImageOnBlockchain(newHash);
      } catch (error) {
        console.log("Blockchain verify fallback failed:", error.message);
      }
    }

    const result = isAuthentic ? "Image Authentic" : "Image Tampered";

    if (req.user) {
      insertUserActivity({
        user_id: req.user.id,
        action_type: "verify",
        image_id: matchedImage ? matchedImage.id : null,
        image_type: matchedImage ? matchedImage.image_type : "",
        result,
        hash: newHash,
        cid: matchedImage ? matchedImage.cid : "",
        place_name: matchedImage ? matchedImage.place_name : ""
      });
    }

    res.json({
      result,
      hash: newHash,
      image: matchedImage ? toPublicImage(matchedImage) : null
    });
  } catch (error) {
    console.error("Verify error:", error);

    res.status(500).json({
      error: "Verification failed",
      details: error.message
    });
  }
});

router.get("/search", optionalAuth, async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (lat === undefined || lng === undefined || lat === "" || lng === "") {
      return res.status(400).json({ error: "lat and lng are required" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({ error: "Valid lat and lng are required" });
    }

    const geohash = generateGeohash(latitude, longitude);
    console.log("Searching for geohash:", geohash);

    let images = findImagesByGeohash(geohash);

    if (!images || images.length === 0) {
      try {
        images = await blockchainService.getImagesByGeohash(geohash);
      } catch (error) {
        console.log("Blockchain search fallback failed:", error.message);
        images = [];
      }
    }

    const publicImages = images.map(toPublicImage);

    if (req.user) {
      if (publicImages.length === 0) {
        insertUserActivity({
          user_id: req.user.id,
          action_type: "search",
          latitude,
          longitude,
          geohash,
          result: "No images found"
        });
      } else {
        publicImages.forEach((img) => {
          insertUserActivity({
            user_id: req.user.id,
            action_type: "search",
            image_id: img.id,
            latitude,
            longitude,
            geohash,
            image_type: img.imageType,
            result: "Image found",
            cid: img.cid,
            place_name: img.placeName
          });
        });
      }
    }

    res.json({
      geohash,
      images: publicImages,
      message: publicImages.length ? "Images found" : "No images found"
    });
  } catch (error) {
    console.error("Search error:", error);

    res.status(500).json({
      error: "Search failed",
      details: error.message
    });
  }
});

router.get("/analytics", (req, res) => {
  try {
    const analytics = getImageAnalytics();

    const typeCounts = {};
    analytics.byType.forEach((row) => {
      typeCounts[row.image_type] = row.count;
    });

    res.json({
      totalImages: analytics.totalImages,
      uniqueLocations: analytics.byGeohash.length,
      tamperedCount: 0,
      typeCounts
    });
  } catch (error) {
    console.error("Analytics error:", error);

    res.status(500).json({
      error: "Analytics failed",
      details: error.message
    });
  }
});

router.get("/history", (req, res) => {
  try {
    const records = getImageHistory().map(toPublicImage);

    res.json({
      records,
      total: records.length
    });
  } catch (error) {
    console.error("History error:", error);

    res.status(500).json({
      error: "History failed",
      details: error.message
    });
  }
});

router.get("/admin/analytics", requireAuth, requireAdmin, (req, res) => {
  try {
    const analytics = getImageAnalytics();

    const typeCounts = {};
    analytics.byType.forEach((row) => {
      typeCounts[row.image_type] = row.count;
    });

    res.json({
      totalImages: analytics.totalImages,
      uniqueLocations: analytics.byGeohash.length,
      tamperedCount: 0,
      typeCounts,
      byType: analytics.byType,
      byGeohash: analytics.byGeohash
    });
  } catch (error) {
    console.error("Admin analytics error:", error);

    res.status(500).json({
      error: "Admin analytics failed",
      details: error.message
    });
  }
});

router.get("/admin/history", requireAuth, requireAdmin, (req, res) => {
  try {
    const records = getImageHistory().map(toAdminImage);

    res.json({
      records,
      total: records.length
    });
  } catch (error) {
    console.error("Admin history error:", error);

    res.status(500).json({
      error: "Admin history failed",
      details: error.message
    });
  }
});

router.get("/admin/users", requireAuth, requireAdmin, (req, res) => {
  try {
    res.json({
      users: getUsersForAdmin()
    });
  } catch (error) {
    res.status(500).json({
      error: "Users fetch failed",
      details: error.message
    });
  }
});

router.get("/user/history", requireAuth, (req, res) => {
  try {
    res.json({
      records: getUserActivity(req.user.id)
    });
  } catch (error) {
    res.status(500).json({
      error: "User history failed",
      details: error.message
    });
  }
});

router.get("/user/analytics", requireAuth, (req, res) => {
  try {
    res.json(getUserAnalytics(req.user.id));
  } catch (error) {
    res.status(500).json({
      error: "User analytics failed",
      details: error.message
    });
  }
});

module.exports = router;
