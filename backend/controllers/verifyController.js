const hashService = require("../services/hashService");
const { verifyImageOnBlockchain } = require("../services/blockchainService");

exports.verifyImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const newHash = hashService.generateHash(req.file.buffer);

        console.log("🔍 Incoming hash:", newHash);

        const isAuthentic = await verifyImageOnBlockchain(newHash);

        res.json({
            result: isAuthentic ? "Image Authentic ✅" : "Image Tampered ❌",
            hash: newHash
        });

    } catch (error) {
        console.error("Verify error:", error);
        res.status(500).json({ error: "Verification failed" });
    }
};