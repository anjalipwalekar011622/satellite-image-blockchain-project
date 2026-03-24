const hashService = require("../services/hashService");
const geohashService = require("../services/geohashService");
const verifyController = require("./verifyController");
const { storeImageOnBlockchain } = require("../services/blockchainService");
const { uploadToIPFS } = require("../../ipfs/ipfsService");

exports.uploadImage = async (req, res) => {

    try {

        console.log("📥 Upload API hit");

        // 🔹 Check if file exists
        if (!req.file) {
            return res.status(400).json({
                error: "No image file uploaded"
            });
        }

        // 🔹 Get image buffer
        const imageBuffer = req.file.buffer;

        // 🔹 Generate hash
        const hash = hashService.generateHash(imageBuffer);
        console.log("🔑 Hash generated:", hash);

        // 🔹 Dummy location
        const latitude = 19.0760;
        const longitude = 72.8777;

        // 🔹 Generate geohash
        const geohash = geohashService.generateGeohash(latitude, longitude);
        console.log("📍 Geohash:", geohash);

        // 🔥 Upload to IPFS (BUFFER VERSION - IMPORTANT FIX)
        console.log("☁️ Uploading to IPFS...");
        const cid = await uploadToIPFS(imageBuffer, req.file.originalname);
        console.log("📦 CID received:", cid);

        // 🔹 Prepare metadata
        const metadata = {
            cid,
            hash,
            geohash,
            latitude,
            longitude
        };

        // 🔥 CALL BLOCKCHAIN
        console.log("🚀 Calling blockchain...");
        try {
            const txHash = await storeImageOnBlockchain(cid, hash, geohash);
            console.log("✅ Blockchain TX:", txHash);
            metadata.txHash = txHash;
        } catch (err) {
            console.log("⚠️ Blockchain failed:", err.message);
        }

        // 🔹 Send response
        res.json(metadata);

    } catch (error) {

        console.log("❌ UPLOAD ERROR:", error);

        res.status(500).json({
            error: "Image processing failed",
            details: error.message
        });

    }

};